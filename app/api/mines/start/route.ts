import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User, GameSession } from '../../../lib/models';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { telegramId, betAmount } = await req.json();

    if (!telegramId || !betAmount) {
      return NextResponse.json({ error: 'Missing information' }, { status: 400 });
    }

    const user = await User.findOne({ telegramId });
    if (!user || user.balance < betAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // به جای ارور دادن، بازی‌های فعال قبلی کاربر را منقضی/بسته می‌کنیم تا گیر نکند
    await GameSession.updateMany(
      { telegramId, status: 'active', gameType: 'mines' },
      { status: 'lost', profit: -betAmount }
    );

    // کسر مبلغ شرط از موجودی کاربر
    user.balance -= betAmount;
    user.totalGames += 1;
    await user.save();

    // تولید تصادفی ۲ بمب در شبکه ۳x3
    const bombs: number[] = [];
    while (bombs.length < 2) {
      const randomBomb = Math.floor(Math.random() * 9);
      if (!bombs.includes(randomBomb)) {
        bombs.push(randomBomb);
      }
    }

    const gameSession = await GameSession.create({
      telegramId,
      gameType: 'mines',
      betAmount,
      status: 'active',
      bombs,
      revealed: [],
      cashoutMultiplier: 1.0,
      profit: 0,
    });

    return NextResponse.json({
      success: true,
      balance: user.balance,
      gameId: gameSession._id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}