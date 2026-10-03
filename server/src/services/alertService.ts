import { Alert, IAlert, AlertType } from '../models/Alert.js';
import { marketProvider } from '../providers/index.js';

export interface CreateAlertDTO {
  userId: string;
  symbol: string;
  type: AlertType;
  targetPrice: number;
  direction?: 'ABOVE' | 'BELOW';
}

export class AlertService {
  async createAlert(dto: CreateAlertDTO): Promise<IAlert> {
    const symbol = dto.symbol.trim().toUpperCase();
    const targetPrice = Number(dto.targetPrice);

    if (isNaN(targetPrice) || targetPrice <= 0) {
      throw new Error('Valid target price greater than 0 is required.');
    }

    // Determine direction if not specified
    let direction = dto.direction;
    if (!direction) {
      try {
        const quote = await marketProvider.getQuote(symbol);
        direction = targetPrice > quote.price ? 'ABOVE' : 'BELOW';
      } catch {
        direction = dto.type === 'STOP_LOSS' ? 'BELOW' : 'ABOVE';
      }
    }

    const alert = new Alert({
      userId: dto.userId,
      symbol,
      type: dto.type,
      direction,
      targetPrice,
      status: 'ACTIVE',
    });

    await alert.save();
    return alert;
  }

  async getUserAlerts(userId: string): Promise<IAlert[]> {
    return Alert.find({ userId }).sort({ createdAt: -1 });
  }

  async cancelAlert(userId: string, alertId: string): Promise<IAlert> {
    const alert = await Alert.findOne({ _id: alertId, userId });
    if (!alert) {
      throw new Error('Alert not found.');
    }
    alert.status = 'CANCELLED';
    await alert.save();
    return alert;
  }

  async evaluateAlerts(): Promise<IAlert[]> {
    const activeAlerts = await Alert.find({ status: 'ACTIVE' });
    if (activeAlerts.length === 0) return [];

    const triggeredAlerts: IAlert[] = [];
    const symbolQuotes = new Map<string, number>();

    for (const alert of activeAlerts) {
      try {
        let currentPrice = symbolQuotes.get(alert.symbol);
        if (currentPrice === undefined) {
          const quote = await marketProvider.getQuote(alert.symbol);
          currentPrice = quote.price;
          symbolQuotes.set(alert.symbol, currentPrice);
        }

        let isTriggered = false;
        if (alert.type === 'STOP_LOSS' && currentPrice <= alert.targetPrice) {
          isTriggered = true;
        } else if (alert.type === 'TARGET' && currentPrice >= alert.targetPrice) {
          isTriggered = true;
        } else if (alert.type === 'PRICE') {
          if (alert.direction === 'ABOVE' && currentPrice >= alert.targetPrice) {
            isTriggered = true;
          } else if (alert.direction === 'BELOW' && currentPrice <= alert.targetPrice) {
            isTriggered = true;
          }
        }

        if (isTriggered) {
          alert.status = 'TRIGGERED';
          alert.triggeredAt = new Date();
          await alert.save();
          triggeredAlerts.push(alert);
        }
      } catch (err) {
        // Skip symbol if quote failed
      }
    }

    return triggeredAlerts;
  }
}

export const alertService = new AlertService();
