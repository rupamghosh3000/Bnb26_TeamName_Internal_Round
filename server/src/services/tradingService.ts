import { Types } from 'mongoose';
import { PaperAccount } from '../models/PaperAccount.js';
import { Position } from '../models/Position.js';
import { Order, OrderSide, OrderType, IOrder } from '../models/Order.js';
import { Trade } from '../models/Trade.js';
import { marketProvider } from '../providers/index.js';
import { portfolioService } from './portfolioService.js';

export interface PlaceOrderDTO {
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
}

export class TradingService {
  async placeOrder(dto: PlaceOrderDTO): Promise<{ order: IOrder; message: string }> {
    const symbol = dto.symbol.trim().toUpperCase();
    const quantity = Math.floor(dto.quantity);

    if (quantity <= 0) {
      throw new Error('Order quantity must be at least 1.');
    }

    // Get latest real market quote
    const quote = await marketProvider.getQuote(symbol);
    const executionPrice = quote.price;

    if (executionPrice <= 0) {
      throw new Error(`Unable to determine valid market price for ${symbol}.`);
    }

    const account = await PaperAccount.findOne({ userId: dto.userId });
    if (!account) {
      throw new Error('Paper trading account not found.');
    }

    // 1. Validation according to order side
    if (dto.side === 'BUY') {
      const estimatedValue = (dto.type === 'LIMIT' && dto.limitPrice ? dto.limitPrice : executionPrice) * quantity;
      if (account.cashBalance < estimatedValue) {
        throw new Error(
          `Insufficient virtual cash. Required: $${estimatedValue.toFixed(2)}, Available: $${account.cashBalance.toFixed(2)}`
        );
      }
    } else if (dto.side === 'SELL') {
      const position = await Position.findOne({ userId: dto.userId, symbol });
      if (!position || position.quantity < quantity) {
        const held = position ? position.quantity : 0;
        throw new Error(
          `Insufficient holdings. You hold ${held} shares of ${symbol}, cannot sell ${quantity}.`
        );
      }
    }

    // Check if limit order should be queued as pending
    let canFillImmediately = dto.type === 'MARKET';
    if (dto.type === 'LIMIT' && dto.limitPrice != null) {
      if (dto.side === 'BUY' && executionPrice <= dto.limitPrice) {
        canFillImmediately = true;
      } else if (dto.side === 'SELL' && executionPrice >= dto.limitPrice) {
        canFillImmediately = true;
      }
    }

    // Create the Order document
    const order = new Order({
      userId: new Types.ObjectId(dto.userId),
      symbol,
      side: dto.side,
      type: dto.type,
      quantity,
      limitPrice: dto.limitPrice,
      status: canFillImmediately ? 'FILLED' : 'PENDING',
      executedPrice: canFillImmediately ? executionPrice : undefined,
      executedAt: canFillImmediately ? new Date() : undefined,
    });
    await order.save();

    if (canFillImmediately) {
      await this.executeFilledOrder(account, order, executionPrice);
      // Trigger background snapshot update
      portfolioService.recordSnapshot(dto.userId).catch(() => {});
      return {
        order,
        message: `Successfully executed ${dto.side} ${quantity} shares of ${symbol} at $${executionPrice.toFixed(2)}.`,
      };
    } else {
      return {
        order,
        message: `Limit ${dto.side} order placed for ${quantity} shares of ${symbol} at $${dto.limitPrice?.toFixed(2)} (Current price: $${executionPrice.toFixed(2)}).`,
      };
    }
  }

  private async executeFilledOrder(account: any, order: IOrder, price: number) {
    const orderValue = price * order.quantity;
    const userId = order.userId;
    const symbol = order.symbol;

    if (order.side === 'BUY') {
      // Deduct cash
      account.cashBalance -= orderValue;
      await account.save();

      // Update position
      const existingPos = await Position.findOne({ userId, symbol });
      if (existingPos) {
        const totalOldCost = existingPos.quantity * existingPos.averagePrice;
        const totalNewCost = order.quantity * price;
        const totalQty = existingPos.quantity + order.quantity;

        existingPos.quantity = totalQty;
        existingPos.averagePrice = totalNewCost + totalOldCost > 0 ? (totalOldCost + totalNewCost) / totalQty : price;
        existingPos.currentPrice = price;
        await existingPos.save();
      } else {
        const newPos = new Position({
          userId,
          symbol,
          quantity: order.quantity,
          averagePrice: price,
          currentPrice: price,
        });
        await newPos.save();
      }

      // Record immutable Trade
      const trade = new Trade({
        userId,
        orderId: order._id,
        symbol,
        side: 'BUY',
        quantity: order.quantity,
        price,
        value: orderValue,
        executedAt: new Date(),
      });
      await trade.save();
    } else if (order.side === 'SELL') {
      const position = await Position.findOne({ userId, symbol });
      if (!position) {
        throw new Error(`Cannot execute sell: no position found for ${symbol}`);
      }

      const realizedPnL = (price - position.averagePrice) * order.quantity;

      // Credit cash
      account.cashBalance += orderValue;
      await account.save();

      // Update position
      if (position.quantity === order.quantity) {
        await Position.deleteOne({ _id: position._id });
      } else {
        position.quantity -= order.quantity;
        position.currentPrice = price;
        await position.save();
      }

      // Record immutable Trade with Realized P&L
      const trade = new Trade({
        userId,
        orderId: order._id,
        symbol,
        side: 'SELL',
        quantity: order.quantity,
        price,
        value: orderValue,
        realizedPnL: Number(realizedPnL.toFixed(2)),
        executedAt: new Date(),
      });
      await trade.save();
    }
  }

  async cancelOrder(userId: string, orderId: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new Error('Order not found.');
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Cannot cancel order in ${order.status} state.`);
    }

    order.status = 'CANCELLED';
    await order.save();
    return order;
  }

  async getOrders(userId: string, limit: number = 50, skip: number = 0) {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Order.countDocuments({ userId });
    return { orders, total };
  }

  async getTrades(userId: string, limit: number = 50, skip: number = 0) {
    const trades = await Trade.find({ userId })
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Trade.countDocuments({ userId });
    return { trades, total };
  }

  // Check and process any pending limit orders against fresh market quotes
  async checkPendingLimitOrders() {
    const pendingOrders = await Order.find({ status: 'PENDING' });
    for (const order of pendingOrders) {
      try {
        const quote = await marketProvider.getQuote(order.symbol);
        const price = quote.price;
        let shouldFill = false;

        if (order.side === 'BUY' && order.limitPrice != null && price <= order.limitPrice) {
          shouldFill = true;
        } else if (order.side === 'SELL' && order.limitPrice != null && price >= order.limitPrice) {
          shouldFill = true;
        }

        if (shouldFill) {
          const account = await PaperAccount.findOne({ userId: order.userId });
          if (account) {
            order.status = 'FILLED';
            order.executedPrice = price;
            order.executedAt = new Date();
            await order.save();
            await this.executeFilledOrder(account, order, price);
          }
        }
      } catch (err) {
        // Continue checking other orders
      }
    }
  }
}

export const tradingService = new TradingService();
