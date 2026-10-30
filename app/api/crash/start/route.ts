import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { telegramId, betAmount } = await req.json();
    const client = await clientPromise;
    const db = client.db('telegram_mini_game');
    const user = await db.collection('users').findOne({ telegramId });

    if (!user || user.balance < betAmount) {
      return NextResponse.json({ success: false, error: 'Insufficient balance' });
    }

    // کم کردن مبلغ شرط
    await db.collection('users').updateOne(
      { telegramId },
      { $inc: { balance: -betAmount } }
    );

    // ==========================================
    // 🔴 حالت تست: قفل کردن ضریب دقیقا روی عدد 5
    // الگوریتم تصادفی موقتا حذف شد
    // ==========================================
    const crashPoint = 5.00; 

    const gameId = uuidv4();

    await db.collection('games').insertOne({
      gameId,
      telegramId,
      type: 'crash',
      betAmount,
      targetCrash: crashPoint,
      status: 'playing',
      createdAt: new Date(),
    });

    const updatedUser = await db.collection('users').findOne({ telegramId });

    return NextResponse.json({
      success: true,
      gameId,
      crashPoint,
      balance: updatedUser?.balance,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' });
  }
}