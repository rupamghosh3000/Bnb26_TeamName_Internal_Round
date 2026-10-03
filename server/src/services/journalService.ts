import { JournalEntry, IJournalEntry } from '../models/JournalEntry.js';
import { Trade } from '../models/Trade.js';
import { aiService } from './aiService.js';

export interface CreateJournalEntryDTO {
  userId: string;
  tradeId?: string;
  symbol: string;
  thesis: string;
  strategyUsed?: string;
  entryReason?: string;
  exitReason?: string;
  emotion?: 'CONFIDENT' | 'ANXIOUS' | 'NEUTRAL' | 'FOMO' | 'DISCIPLINED';
  outcomeNotes?: string;
}

export class JournalService {
  async createEntry(dto: CreateJournalEntryDTO): Promise<IJournalEntry> {
    const symbol = dto.symbol.trim().toUpperCase();

    let aiReview: string | undefined;
    if (dto.tradeId) {
      try {
        const review = await aiService.reviewTrade(dto.userId, dto.tradeId);
        aiReview = review.answer;
      } catch {
        // Continue without AI review if unavailable
      }
    }

    const entry = new JournalEntry({
      userId: dto.userId,
      tradeId: dto.tradeId,
      symbol,
      thesis: dto.thesis,
      strategyUsed: dto.strategyUsed,
      entryReason: dto.entryReason,
      exitReason: dto.exitReason,
      emotion: dto.emotion || 'NEUTRAL',
      outcomeNotes: dto.outcomeNotes,
      aiReview,
    });

    await entry.save();
    return entry;
  }

  async getEntries(userId: string): Promise<IJournalEntry[]> {
    return JournalEntry.find({ userId })
      .populate('tradeId')
      .sort({ createdAt: -1 });
  }

  async getEntryById(id: string, userId: string): Promise<IJournalEntry | null> {
    return JournalEntry.findOne({ _id: id, userId }).populate('tradeId');
  }

  async updateEntry(id: string, userId: string, updates: Partial<CreateJournalEntryDTO>): Promise<IJournalEntry | null> {
    return JournalEntry.findOneAndUpdate({ _id: id, userId }, { $set: updates }, { new: true });
  }

  async deleteEntry(id: string, userId: string): Promise<boolean> {
    const res = await JournalEntry.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
  }
}

export const journalService = new JournalService();
