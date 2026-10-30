import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User, GameSession } from '../../../lib/models';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { telegramId, betAmount } = await req.json();

    if (!telegramId || !betAmount) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    const user = await User.findOne({ telegramId });
    if (!user || user.balance < betAmount) {
      return NextResponse.json({ error: 'موجودی کافی نیست' }, { status: 400 });
    }

    // کسر موجودی
    user.balance -= betAmount;
    user.totalGames += 1;
    await user.save();

    // تولید ضریب انفجار تصادفی در سرور
    const randomValue = Math.random();
    let crashPoint = parseFloat((1 / (1 - randomValue * 0.95)).toFixed(2));
    if (crashPoint < 1.01) crashPoint = 1.01;
    if (crashPoint > 15.0) crashPoint = 15.0;

    const startTime = Date.now();

    const gameSession = await GameSession.create({
      telegramId,
      gameType: 'crash',
      betAmount,
      status: 'active',
      crashPoint,
      startTime,
      cashoutMultiplier: 0,
      profit: 0,
    });

    return NextResponse.json({
      success: true,
      balance: user.balance,
      gameId: gameSession._id,
      startTime,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}