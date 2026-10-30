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

    // کم کردن مبلغ شرط از حساب کاربر
    await db.collection('users').updateOne(
      { telegramId },
      { $inc: { balance: -betAmount } }
    );

    // ==================================================
    // الگوریتم استاندارد جهانی کازینو برای کرش (Provably Fair)
    // ==================================================
    const randomSeed = Math.random(); 
    
    // شانس 1 درصدی برای کرش روی ضریب 1.00 (House Edge یا سود سایت)
    let crashPoint = 1.00;
    
    if (randomSeed >= 0.01) {
      // تولید ضریب تصادفی با وزن‌دهی استاندارد (هرچه عدد بالاتر، شانس کمتر)
      crashPoint = Math.floor(100 * (1 / (1 - randomSeed))) / 100;
    }

    // محدود کردن حداکثر ضریب به 100 برای جلوگیری از طولانی شدن بیش از حد
    if (crashPoint > 100) {
      crashPoint = 100.00;
    }

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
    console.error('Crash Start API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' });
  }
}