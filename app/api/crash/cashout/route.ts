import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { User, GameSession } from '../../../lib/models';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { telegramId, gameId, clientMultiplier } = await req.json();

    const game = await GameSession.findOne({ _id: gameId, telegramId, status: 'active' });
    if (!game) {
      return NextResponse.json({ error: 'بازی فعالی یافت نشد' }, { status: 400 });
    }

    const elapsedTime = (Date.now() - game.startTime!) / 1000;
    const serverMultiplier = parseFloat((1 + elapsedTime * 0.5).toFixed(2));

    if (clientMultiplier > game.crashPoint! || clientMultiplier > serverMultiplier + 0.2) {
      game.status = 'lost';
      game.profit = -game.betAmount;
      await game.save();

      return NextResponse.json({
        success: true,
        won: false,
        crashPoint: game.crashPoint,
        message: 'بازی منفجر شد!',
      });
    }

    const winnings = Math.floor(game.betAmount * clientMultiplier);
    const profit = winnings - game.betAmount;

    game.status = 'won';
    game.cashoutMultiplier = clientMultiplier;
    game.profit = profit;
    await game.save();

    const user = await User.findOne({ telegramId });
    user.balance += winnings;
    user.totalWins += 1;
    user.totalProfit += profit;
    if (clientMultiplier > user.bestMultiplier) {
      user.bestMultiplier = clientMultiplier;
    }
    await user.save();

    return NextResponse.json({
      success: true,
      won: true,
      winnings,
      profit,
      balance: user.balance,
      crashPoint: game.crashPoint,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}