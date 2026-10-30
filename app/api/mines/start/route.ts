import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { telegramId, betAmount } = await req.json();

    if (!telegramId || !betAmount) {
      return NextResponse.json({ error: 'Missing information' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('telegram_mini_game');
    const user = await db.collection('users').findOne({ telegramId });

    if (!user || user.balance < betAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await db.collection('games').updateMany(
      { telegramId, status: 'active', gameType: 'mines' },
      { $set: { status: 'lost', profit: -betAmount } }
    );

    await db.collection('users').updateOne(
      { telegramId },
      { $inc: { balance: -betAmount, totalGames: 1 } }
    );

    const bombs: number[] = [];
    while (bombs.length < 2) {
      const randomBomb = Math.floor(Math.random() * 9);
      if (!bombs.includes(randomBomb)) {
        bombs.push(randomBomb);
      }
    }

    const gameId = uuidv4();

    await db.collection('games').insertOne({
      gameId, // 🟢 تغییر به gameId به جای _id
      telegramId,
      gameType: 'mines',
      betAmount,
      status: 'active',
      bombs,
      revealed: [],
      cashoutMultiplier: 1.0,
      profit: 0,
      createdAt: new Date(),
    });

    const updatedUser = await db.collection('users').findOne({ telegramId });

    return NextResponse.json({
      success: true,
      balance: updatedUser?.balance,
      gameId,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}