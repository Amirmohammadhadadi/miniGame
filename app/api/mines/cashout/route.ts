import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(req: Request) {
  try {
    const { telegramId, gameId } = await req.json();

    const client = await clientPromise;
    const db = client.db('telegram_mini_game');
    
    // 🟢 جستجو بر اساس gameId
    const game = await db.collection('games').findOne({ gameId, telegramId, status: 'active' });

    if (!game || !game.revealed || game.revealed.length === 0) {
      return NextResponse.json({ error: 'امکان برداشت وجود ندارد' }, { status: 400 });
    }

    const multiplier = game.cashoutMultiplier;
    const winnings = Math.floor(game.betAmount * multiplier);
    const profit = winnings - game.betAmount;

    // 🟢 آپدیت بر اساس gameId
    await db.collection('games').updateOne(
      { gameId },
      { $set: { status: 'won', profit } }
    );

    const user = await db.collection('users').findOne({ telegramId });
    const bestM = user?.bestMultiplier || 1.0;

    await db.collection('users').updateOne(
      { telegramId },
      { 
        $inc: { balance: winnings, totalWins: 1, totalProfit: profit },
        $set: { bestMultiplier: Math.max(bestM, multiplier) }
      }
    );

    const updatedUser = await db.collection('users').findOne({ telegramId });

    return NextResponse.json({
      success: true,
      winnings,
      profit,
      balance: updatedUser?.balance,
      bombs: game.bombs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}