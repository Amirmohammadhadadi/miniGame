import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

const MULTIPLIERS = [1.25, 1.56, 1.95, 2.44, 3.05, 3.81, 4.76];

export async function POST(req: Request) {
  try {
    const { telegramId, gameId, tileIndex } = await req.json();

    const client = await clientPromise;
    const db = client.db('telegram_mini_game');
    
    // 🟢 جستجو بر اساس gameId
    const game = await db.collection('games').findOne({ gameId, telegramId, status: 'active' });

    if (!game) {
      return NextResponse.json({ error: 'بازی فعالی یافت نشد' }, { status: 400 });
    }

    if (game.revealed?.includes(tileIndex)) {
      return NextResponse.json({ error: 'این خانه قبلاً باز شده است' }, { status: 400 });
    }

    if (game.bombs?.includes(tileIndex)) {
      // 🟢 آپدیت بر اساس gameId
      await db.collection('games').updateOne(
        { gameId }, 
        { $set: { status: 'lost', profit: -game.betAmount } }
      );

      return NextResponse.json({
        success: true,
        hitBomb: true,
        bombs: game.bombs,
        message: 'به بمب برخورد کردید! باختید.',
      });
    }

    const newRevealed = [...(game.revealed || []), tileIndex];
    const revealedCount = newRevealed.length;
    const currentMultiplier = MULTIPLIERS[Math.min(revealedCount - 1, MULTIPLIERS.length - 1)];

    if (revealedCount === 7) {
      const winnings = Math.floor(game.betAmount * currentMultiplier);
      const profit = winnings - game.betAmount;

      await db.collection('games').updateOne(
        { gameId },
        { $set: { status: 'won', profit, cashoutMultiplier: currentMultiplier, revealed: newRevealed } }
      );

      const user = await db.collection('users').findOne({ telegramId });
      const bestM = user?.bestMultiplier || 1.0;

      await db.collection('users').updateOne(
        { telegramId },
        { 
          $inc: { balance: winnings, totalWins: 1, totalProfit: profit },
          $set: { bestMultiplier: Math.max(bestM, currentMultiplier) }
        }
      );

      const updatedUser = await db.collection('users').findOne({ telegramId });

      return NextResponse.json({
        success: true,
        hitBomb: false,
        wonGame: true,
        multiplier: currentMultiplier,
        winnings,
        balance: updatedUser?.balance,
      });
    }

    await db.collection('games').updateOne(
      { gameId },
      { $set: { cashoutMultiplier: currentMultiplier, revealed: newRevealed } }
    );

    return NextResponse.json({
      success: true,
      hitBomb: false,
      wonGame: false,
      multiplier: currentMultiplier,
      revealed: newRevealed,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}