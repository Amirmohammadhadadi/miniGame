import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb'; // دقت کنید که مسیر Import درست باشد بر اساس جایگاه فایل

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'آیدی تلگرام الزامی است' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('telegram_mini_game');
    
    // گرفتن ۱۰ بازی آخر
    const history = await db.collection('games')
      .find({ telegramId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}