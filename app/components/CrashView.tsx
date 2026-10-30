'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { RefreshCw } from 'lucide-react';

export default function CrashView() {
  const { user, updateBalance } = useGameStore();
  const [betAmount, setBetAmount] = useState<number | string>(50);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'playing' | 'crashed' | 'cashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [statusText, setStatusText] = useState('Ready to play');
  const [countdown, setCountdown] = useState(3);
  
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    const numericBet = Number(betAmount);
    if (!numericBet || numericBet <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }
    if (user && numericBet > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setGameState('waiting');
    setCountdown(3);
    setStatusText('Next round starting soon...');

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownRef.current);
        launchCrashGame(numericBet);
      }
    }, 1000);
  };

  const launchCrashGame = async (numericBet: number) => {
    try {
      const res = await fetch('/api/crash/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user?.telegramId, betAmount: numericBet }),
      });
      const data = await res.json();
      if (data.success) {
        setGameId(data.gameId);
        updateBalance(data.balance);
        setGameState('playing');
        setMultiplier(1.0);
        setStatusText('Rocket launching...');

        const startTime = data.startTime;
        const targetCrashPoint = data.crashPoint || (1.2 + Math.random() * 3.5);

        timerRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const currentM = parseFloat((1 + elapsed * 0.4).toFixed(2));
          
          if (currentM >= targetCrashPoint) {
            clearInterval(timerRef.current);
            triggerCrashState(targetCrashPoint);
          } else {
            setMultiplier(currentM);
          }
        }, 100);
      } else {
        alert(data.error);
        setGameState('idle');
      }
    } catch (err) {
      console.error(err);
      setGameState('idle');
    }
  };

  const triggerCrashState = async (finalMultiplier: number) => {
    setGameState('crashed');
    setMultiplier(finalMultiplier);
    setStatusText(`Crashed at ${finalMultiplier}x 💥`);

    try {
      await fetch('/api/crash/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user?.telegramId, gameId, clientMultiplier: finalMultiplier + 10 }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const cashOut = async () => {
    if (gameState !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const lockedMultiplier = multiplier;

    try {
      const res = await fetch('/api/crash/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user?.telegramId, gameId, clientMultiplier: lockedMultiplier }),
      });
      const data = await res.json();

      if (data.success && data.won) {
        updateBalance(data.balance);
        setGameState('cashed');
        setMultiplier(lockedMultiplier);
        setStatusText(`Success! Won ${data.winnings} Coins 🚀`);
      } else {
        setGameState('crashed');
        setMultiplier(data.crashPoint || lockedMultiplier);
        setStatusText(`Crashed! (${data.crashPoint}x) 💥`);
      }
    } catch (err) {
      console.error(err);
      setGameState('crashed');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 pb-6 w-full max-w-md mx-auto">
      <div className="w-full h-60 sm:h-64 bg-zinc-900/90 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.12)_0,transparent_70%)]"></div>
        
        {gameState === 'waiting' ? (
          <div className="flex flex-col items-center animate-pulse">
            <span className="text-5xl font-black text-amber-400">{countdown}</span>
            <span className="text-xs text-zinc-400 mt-2">Next round starting...</span>
          </div>
        ) : (
          <>
            <span className={`text-6xl font-black transition-colors ${gameState === 'crashed' ? 'text-red-500' : gameState === 'cashed' ? 'text-emerald-400' : 'text-orange-400 drop-shadow-[0_0_25px_rgba(249,115,22,0.6)]'}`}>
              {multiplier.toFixed(2)}x
            </span>
            <span className="text-xs text-zinc-400 mt-2 font-medium">{statusText}</span>
          </>
        )}
      </div>

      <div className="w-full space-y-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs text-zinc-400 font-medium px-1">Enter Bet Amount (Coins):</label>
          <input
            type="number"
            value={betAmount}
            disabled={gameState === 'waiting' || gameState === 'playing'}
            onChange={(e) => setBetAmount(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-bold focus:outline-none focus:border-orange-500 transition-colors text-sm"
            placeholder="Enter coins..."
            min="1"
          />
        </div>

        {gameState === 'idle' || gameState === 'crashed' || gameState === 'cashed' ? (
          <button
            onClick={startCountdown}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-zinc-950 font-black rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:brightness-110 transition-all cursor-pointer text-sm tracking-wide flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Start Crash Round
          </button>
        ) : gameState === 'waiting' ? (
          <button
            disabled
            className="w-full py-4 bg-zinc-800 text-zinc-400 font-bold rounded-2xl cursor-not-allowed text-sm tracking-wide"
          >
            Waiting for Round ({countdown}s)...
          </button>
        ) : (
          <button
            onClick={cashOut}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all animate-pulse cursor-pointer text-sm tracking-wide"
          >
            Cash Out Now
          </button>
        )}
      </div>
    </div>
  );
}