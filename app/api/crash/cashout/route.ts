import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb'; // ایمپورت استاندارد و جدید

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegramId, gameId, clientMultiplier } = body;

    if (!telegramId || !gameId || !clientMultiplier) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('telegram_mini_game');
    const gamesCollection = db.collection('games');
    const usersCollection = db.collection('users');

    // پیدا کردن بازی مربوطه
    const game = await gamesCollection.findOne({ gameId, telegramId });

    if (!game) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    // بررسی اینکه آیا بازی قبلاً کش‌اوت شده یا کرش کرده است
    if (game.status !== 'playing') {
      return NextResponse.json({ success: false, error: 'Game already ended' }, { status: 400 });
    }

    // 🔴 بررسی حیاتی: آیا کاربر زودتر از کرش شدن موشک خروج زده است؟
    // game.targetCrash همان عددی است که بک‌اند در زمان استارت بازی تولید کرده بود
    if (clientMultiplier > game.targetCrash) {
      // کاربر متقلب یا تأخیر اینترنت! او در نقطه‌ای کش‌اوت کرده که موشک قبلاً ترکیده است.
      await gamesCollection.updateOne(
        { gameId },
        { $set: { status: 'crashed', cashedOutAt: null } }
      );
      return NextResponse.json({ success: false, won: false, error: 'Rocket crashed before you cashed out!' });
    }

    // ✅ خروج موفقیت‌آمیز
    const winnings = Math.floor(game.betAmount * clientMultiplier);

    // ۱. آپدیت وضعیت بازی به 'cashed'
    await gamesCollection.updateOne(
      { gameId },
      { $set: { status: 'cashed', cashedOutAt: clientMultiplier, winnings } }
    );

    // ۲. واریز پول به کیف پول کاربر
    await usersCollection.updateOne(
      { telegramId },
      { $inc: { balance: winnings } }
    );

    const updatedUser = await usersCollection.findOne({ telegramId });

    return NextResponse.json({ 
      success: true, 
      won: true, 
      winnings, 
      balance: updatedUser?.balance 
    });

  } catch (error) {
    console.error('Cashout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}