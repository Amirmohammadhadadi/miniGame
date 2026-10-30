import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User, GameSession } from '../../../lib/models';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { telegramId, gameId } = await req.json();

    const game = await GameSession.findOne({ _id: gameId, telegramId, status: 'active' });
    if (!game || !game.revealed || game.revealed.length === 0) {
      return NextResponse.json({ error: 'امکان برداشت وجود ندارد' }, { status: 400 });
    }

    const multiplier = game.cashoutMultiplier;
    const winnings = Math.floor(game.betAmount * multiplier);
    const profit = winnings - game.betAmount;

    game.status = 'won';
    game.profit = profit;
    await game.save();

    // واریز جایزه به کیف پول کاربر
    const user = await User.findOne({ telegramId });
    user.balance += winnings;
    user.totalWins += 1;
    user.totalProfit += profit;
    if (multiplier > user.bestMultiplier) {
      user.bestMultiplier = multiplier;
    }
    await user.save();

    return NextResponse.json({
      success: true,
      winnings,
      profit,
      balance: user.balance,
      bombs: game.bombs, // نشان دادن جای بمب‌ها بعد از Cash Out
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}