import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import { User } from '../../lib/models';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { telegramId, firstName, username, photoUrl } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // بررسی اینکه آیا کاربر قبلاً ثبت‌نام کرده است یا خیر
    let user = await User.findOne({ telegramId });

    if (!user) {
      // اگر کاربر جدید بود، با ۱۰۰۰ سکه اولیه ثبت‌نامش کن
      user = await User.create({
        telegramId,
        firstName: firstName || 'کاربر تلگرام',
        username: username || '',
        photoUrl: photoUrl || '',
        balance: 1000, // ۱۰۰۰ سکه اولیه طبق قوانین تسک
        totalGames: 0,
        totalWins: 0,
        totalProfit: 0,
        bestMultiplier: 0,
      });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}