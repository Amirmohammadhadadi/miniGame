import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import { GameSession } from '../../lib/models';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'آیدی تلگرام الزامی است' }, { status: 400 });
    }

    const history = await GameSession.find({ telegramId })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}