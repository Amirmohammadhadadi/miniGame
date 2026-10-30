import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User, GameSession } from '../../../lib/models';

// جدول ضرایب استاندارد بازی Mines برای شبکه ۳x3 با ۲ بمب
const MULTIPLIERS = [1.25, 1.56, 1.95, 2.44, 3.05, 3.81, 4.76];

export async function POST(req: Request) {
  try {
    await connectDB();
    const { telegramId, gameId, tileIndex } = await req.json();

    const game = await GameSession.findOne({ _id: gameId, telegramId, status: 'active' });
    if (!game) {
      return NextResponse.json({ error: 'بازی فعالی یافت نشد' }, { status: 400 });
    }

    if (game.revealed?.includes(tileIndex)) {
      return NextResponse.json({ error: 'این خانه قبلاً باز شده است' }, { status: 400 });
    }

    // بررسی اینکه آیا خانه انتخابی بمب است یا خیر
    if (game.bombs?.includes(tileIndex)) {
      // باخت! کاربر به بمب برخورد کرد
      game.status = 'lost';
      game.profit = -game.betAmount;
      await game.save();

      return NextResponse.json({
        success: true,
        hitBomb: true,
        bombs: game.bombs, // نمایش بمب‌ها به کاربر در پایان بازی
        message: 'به بمب برخورد کردید! باختید.',
      });
    }

    // خانه امن بود
    game.revealed?.push(tileIndex);
    const revealedCount = game.revealed?.length || 1;
    const currentMultiplier = MULTIPLIERS[Math.min(revealedCount - 1, MULTIPLIERS.length - 1)];
    
    game.cashoutMultiplier = currentMultiplier;
    await game.save();

    // اگر تمام ۷ خانه امن باز شد، بازی به صورت خودکار برنده می‌شود
    if (revealedCount === 7) {
      const winnings = Math.floor(game.betAmount * currentMultiplier);
      const profit = winnings - game.betAmount;

      game.status = 'won';
      game.profit = profit;
      await game.save();

      const user = await User.findOne({ telegramId });
      user.balance += winnings;
      user.totalWins += 1;
      user.totalProfit += profit;
      if (currentMultiplier > user.bestMultiplier) {
        user.bestMultiplier = currentMultiplier;
      }
      await user.save();

      return NextResponse.json({
        success: true,
        hitBomb: false,
        wonGame: true,
        multiplier: currentMultiplier,
        winnings,
        balance: user.balance,
      });
    }

    return NextResponse.json({
      success: true,
      hitBomb: false,
      wonGame: false,
      multiplier: currentMultiplier,
      revealed: game.revealed,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}