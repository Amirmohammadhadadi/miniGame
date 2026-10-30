'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { RefreshCw, Rocket } from 'lucide-react';

export default function CrashView() {
  const { user, updateBalance } = useGameStore();
  const [betAmount, setBetAmount] = useState<string>('50');
  const [gameId, setGameId] = useState<string | null>(null);
  
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'playing' | 'cashed' | 'crashed'>('idle');
  const [cashOutM, setCashOutM] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  
  const multiplierRef = useRef<HTMLSpanElement>(null);
  const currentMultiplier = useRef<number>(1.0);
  const targetCrash = useRef<number>(1.0);
  const animationRef = useRef<number>(0);
  const startTime = useRef<number>(0);
  
  const isProcessingRef = useRef<boolean>(false); 
  const countdownRef = useRef<any>(null);

  useEffect(() => {
    if (multiplierRef.current) {
      multiplierRef.current.innerText = '1.00x';
      multiplierRef.current.style.color = '#71717a'; 
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    if (isProcessingRef.current) return;
    if (gameState !== 'idle' && gameState !== 'crashed') return;

    const numericBet = Number(betAmount);
    if (!numericBet || numericBet <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }
    if (user && numericBet > user.balance) {
      alert('Insufficient balance');
      return;
    }

    isProcessingRef.current = true;
    setGameState('waiting');
    setCountdown(3);
    setCashOutM(null);
    currentMultiplier.current = 1.0;
    
    if (multiplierRef.current) {
      multiplierRef.current.innerText = '1.00x';
      multiplierRef.current.style.color = '#fb923c'; 
    }

    let count = 3;
    if (countdownRef.current) clearInterval(countdownRef.current);
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
        
        targetCrash.current = data.crashPoint;
        startTime.current = Date.now();

        const tick = () => {
          const elapsed = (Date.now() - startTime.current) / 1000;
          
          // 🔴 تغییر مهم: عدد 0.06 به 0.03 تغییر کرد تا سرعت دقیقا نصف شود
          let current = Math.exp(0.03 * elapsed);

          if (current >= targetCrash.current) {
            currentMultiplier.current = targetCrash.current;
            if (multiplierRef.current) {
              multiplierRef.current.innerText = `${targetCrash.current.toFixed(2)}x`;
              multiplierRef.current.style.color = '#ef4444'; 
            }
            setGameState('crashed');
            isProcessingRef.current = false; 
            return; 
          } 
          
          currentMultiplier.current = current;
          if (multiplierRef.current) {
            multiplierRef.current.innerText = `${current.toFixed(2)}x`;
          }
          animationRef.current = requestAnimationFrame(tick);
        };
        
        animationRef.current = requestAnimationFrame(tick);
      } else {
        alert(data.error);
        setGameState('idle');
        isProcessingRef.current = false;
      }
    } catch (err) {
      console.error(err);
      setGameState('idle');
      isProcessingRef.current = false;
    }
  };

  const cashOut = async () => {
    if (gameState !== 'playing') return;
    
    const lockedMultiplier = parseFloat(currentMultiplier.current.toFixed(2));
    setCashOutM(lockedMultiplier);
    setGameState('cashed'); 

    try {
      const res = await fetch('/api/crash/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user?.telegramId, gameId, clientMultiplier: lockedMultiplier }),
      });
      const data = await res.json();
      if (data.success && data.won) {
        updateBalance(data.balance);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 pb-6 w-full max-w-md mx-auto">
      <div className="w-full h-64 bg-zinc-900/90 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0,transparent_60%)]"></div>
        
        {gameState === 'waiting' ? (
          <div className="flex flex-col items-center z-10 animate-pulse">
            <span className="text-6xl font-black text-amber-400">{countdown}</span>
            <span className="text-sm text-zinc-400 mt-2 uppercase tracking-widest font-bold">Starting...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center z-10 w-full px-4">
            <span 
              ref={multiplierRef}
              className="text-7xl font-black transition-colors duration-100 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]"
            ></span>
            
            <div className="h-10 mt-6 flex items-center justify-center">
              {cashOutM && gameState !== 'crashed' && (
                <div className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-full animate-bounce">
                  <span className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                    ✅ Secured {cashOutM.toFixed(2)}x
                  </span>
                </div>
              )}
              {gameState === 'crashed' && (
                <span className="text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                  Crashed
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/80 backdrop-blur-md">
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-zinc-400 font-semibold px-1">Bet Amount (Coins):</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            disabled={gameState === 'waiting' || gameState === 'playing' || gameState === 'cashed'}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 font-black focus:outline-none focus:border-orange-500 transition-all text-lg disabled:opacity-50 text-center"
            placeholder="0"
            min="1"
          />
        </div>

        {gameState === 'idle' || gameState === 'crashed' ? (
          <button
            onClick={startCountdown}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-zinc-950 font-black rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:brightness-110 transition-all cursor-pointer text-lg tracking-wide flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Place Bet
          </button>
        ) : gameState === 'waiting' ? (
          <button
            disabled
            className="w-full py-4 bg-zinc-800 text-zinc-500 font-bold rounded-2xl cursor-not-allowed text-lg tracking-wide"
          >
            Starting in {countdown}s...
          </button>
        ) : gameState === 'cashed' ? (
          <button
            disabled
            className="w-full py-4 bg-zinc-900 text-emerald-500 border border-emerald-500/30 font-bold rounded-2xl cursor-not-allowed text-lg tracking-wide flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5 animate-pulse" /> Flying...
          </button>
        ) : (
          <button
            onClick={cashOut}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all cursor-pointer text-xl tracking-wide uppercase"
          >
            Cash Out
          </button>
        )}
      </div>
    </div>
  );
}