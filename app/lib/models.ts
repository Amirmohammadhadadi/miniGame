import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  telegramId: string;
  firstName: string;
  username?: string;
  photoUrl?: string;
  balance: number;
  totalGames: number;
  totalWins: number;
  totalProfit: number;
  bestMultiplier: number;
}

export interface IGameSession {
  _id: string;
  telegramId: string;
  gameType: 'mines' | 'crash';
  betAmount: number;
  status: 'active' | 'won' | 'lost';
  // فیلدهای اختصاصی Mines
  bombs?: number[];
  revealed?: number[];
  // فیلدهای اختصاصی Crash
  crashPoint?: number;
  startTime?: number;
  // نتایج
  cashoutMultiplier: number;
  profit: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, default: 'کاربر تلگرام' },
    username: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    balance: { type: Number, default: 1000 }, // ۱۰۰۰ سکه اولیه طبق نیازمندی تسک
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    bestMultiplier: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GameSessionSchema = new Schema<IGameSession>(
  {
    telegramId: { type: String, required: true, index: true },
    gameType: { type: String, enum: ['mines', 'crash'], required: true },
    betAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'won', 'lost'], default: 'active', index: true },
    
    // Mines: اعداد ۰ تا ۸ برای خانه‌های جدول ۳×۳
    bombs: { type: [Number], default: [] },
    revealed: { type: [Number], default: [] },
    
    // Crash: نقطه انفجار و زمان شروع سرور
    crashPoint: { type: Number, default: 1.0 },
    startTime: { type: Number, default: 0 },
    
    cashoutMultiplier: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
export const GameSession = models.GameSession || model<IGameSession>('GameSession', GameSessionSchema);