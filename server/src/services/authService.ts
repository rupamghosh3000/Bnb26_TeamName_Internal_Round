import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { PaperAccount } from '../models/PaperAccount.js';
import { Watchlist } from '../models/Watchlist.js';
import { config } from '../config/environment.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  account: {
    startingCash: number;
    cashBalance: number;
  };
}

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'USER',
      preferences: {
        currency: 'USD',
        timezone: 'America/New_York',
        theme: 'lavender',
      },
    });

    await user.save();

    // Create Paper Account with $100,000 starting cash
    const account = new PaperAccount({
      userId: user._id,
      startingCash: config.trading.defaultStartingCash,
      cashBalance: config.trading.defaultStartingCash,
    });
    await account.save();

    // Create default starter watchlist
    const defaultWatchlist = new Watchlist({
      userId: user._id,
      name: 'Primary Watchlist',
      symbols: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'],
    });
    await defaultWatchlist.save();

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      account: {
        startingCash: account.startingCash,
        cashBalance: account.cashBalance,
      },
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    let account = await PaperAccount.findOne({ userId: user._id });
    if (!account) {
      account = new PaperAccount({
        userId: user._id,
        startingCash: config.trading.defaultStartingCash,
        cashBalance: config.trading.defaultStartingCash,
      });
      await account.save();
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      account: {
        startingCash: account.startingCash,
        cashBalance: account.cashBalance,
      },
    };
  }

  async getMe(userId: string) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new Error('User not found.');
    }

    let account = await PaperAccount.findOne({ userId: user._id });
    if (!account) {
      account = new PaperAccount({
        userId: user._id,
        startingCash: config.trading.defaultStartingCash,
        cashBalance: config.trading.defaultStartingCash,
      });
      await account.save();
    }

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      account: {
        startingCash: account.startingCash,
        cashBalance: account.cashBalance,
      },
    };
  }

  private generateToken(user: IUser): string {
    return jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );
  }
}

export const authService = new AuthService();
