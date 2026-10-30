import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { telegramId, firstName, username, photoUrl } = body;

    if (!telegramId) {
      return NextResponse.json({ success: false, error: 'Telegram ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('telegram_mini_game');
    const usersCollection = db.collection('users');

    let user = await usersCollection.findOne({ telegramId });

    if (!user) {
      const newUser = {
        telegramId,
        firstName: firstName || 'User',
        username: username || '',
        photoUrl: photoUrl || '',
        balance: 1000, 
        createdAt: new Date(),
      };
      
      // گرفتن نتیجه ثبت نام برای استخراج _id
      const result = await usersCollection.insertOne(newUser);
      
      // ✅ حل ارور تایپ‌اسکریپت: اضافه کردن _id به آبجکت
      user = { ...newUser, _id: result.insertedId } as any;

    } else {
      await usersCollection.updateOne(
        { telegramId },
        { $set: { firstName, username, photoUrl } }
      );
      user.firstName = firstName;
      user.username = username;
      user.photoUrl = photoUrl;
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}