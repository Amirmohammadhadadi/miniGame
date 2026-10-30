'use client';

import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Sparkles, Coins } from 'lucide-react';

export default function MinesView() {
  const { user, updateBalance } = useGameStore();
  const [betAmount, setBetAmount] = useState<number | string>(50);
  const [gameId, setGameId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameOver, setGameOver] = useState(false);
  const [bombs, setBombs] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const startGame = async () => {
    if (isStarting || isPlaying) return;

    const numericBet = Number(betAmount);
    if (!numericBet || numericBet <= 0) {
      alert('Please enter a valid bet amount.');
      return;
    }
    if (user && numericBet > user.balance) {
      alert('Insufficient balance.');
      return;
    }

    setIsStarting(true);
    try {
      const res = await fetch('/api/mines/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user?.telegramId || '123456789', betAmount: numericBet }),
      });
      const data = await res.json();
      
      if (data.success) {
        setGameId(data.gameId);
        updateBalance(data.balance);
        setIsPlaying(true);
        setRevealedTiles([]);
        setMultiplier(1.00);
        setGameOver(false);
        setBombs([]);
        setMessage('Game started! Select safe tiles.');
      } else {
        alert(data.error || 'Failed to start game.');
      }
    } catch (err) {
      console.error('Error starting mines game:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const revealTile = async (index: number) => {
    if (!isPlaying || revealedTiles.includes(index) || gameOver || !gameId) {
      return;
    }

    try {
      const res = await fetch('/api/mines/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.telegramId || '123456789',
          gameId,
          tileIndex: index,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.hitBomb) {
          setGameOver(true);
          setIsPlaying(false);
          setBombs(data.bombs || []);
          setMessage('Boom! You hit a bomb 💥');
        } else {
          setRevealedTiles((prev) => [...prev, index]);
          setMultiplier(data.multiplier || multiplier);
          if (data.wonGame) {
            setGameOver(true);
            setIsPlaying(false);
            updateBalance(data.balance);
            setMessage('Congratulations! All safe tiles cleared 🎉');
          } else {
            setMessage('Safe choice! Keep going or Cash Out.');
          }
        }
      } else {
        alert(data.error || 'Invalid move.');
      }
    } catch (err) {
      console.error('Error revealing tile:', err);
    }
  };

  const cashOut = async () => {
    if (!gameId || !isPlaying) return;

    try {
      const res = await fetch('/api/mines/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user?.telegramId || '123456789', gameId }),
      });
      const data = await res.json();
      
      if (data.success) {
        updateBalance(data.balance);
        setGameOver(true);
        setIsPlaying(false);
        setBombs(data.bombs || []);
        setMessage(`Successfully cashed out! +${data.winnings} Coins 💰`);
      } else {
        alert(data.error || 'Cash out failed.');
      }
    } catch (err) {
      console.error('Error during cash out:', err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 pb-6 w-full max-w-md mx-auto">
      <div className="w-full flex justify-between items-center bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Current Multiplier</span>
          <span className="text-cyan-400 font-black text-lg">{multiplier.toFixed(2)}x</span>
        </div>
        {isPlaying && (
          <button
            onClick={cashOut}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-zinc-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Cash Out
          </button>
        )}
      </div>

      {/* Fully Responsive Grid Container */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[360px] aspect-square">
        {Array.from({ length: 9 }).map((_, index) => {
          const isRevealed = revealedTiles.includes(index);
          const isBomb = bombs.includes(index);
          const isGameEnded = gameOver;

          let cardStyle = "bg-zinc-900/90 border-zinc-800 hover:border-cyan-500/60 text-zinc-500 hover:bg-zinc-800/80 shadow-md";
          let content = "💎";

          if (isRevealed) {
            cardStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[0.98]";
            content = "💎";
          } else if (isBomb && isGameEnded) {
            cardStyle = "bg-red-950/90 border-red-500 text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse";
            content = "💣";
          } else if (isGameEnded && !isRevealed) {
            cardStyle = "bg-zinc-950/40 border-zinc-900 text-zinc-700 opacity-60";
            content = "✨";
          }

          return (
            <div key={index} className="w-full aspect-square relative">
              <button
                onClick={() => revealTile(index)}
                disabled={!isPlaying || isRevealed || isGameEnded}
                className={`w-full h-full rounded-2xl relative transition-all duration-300 cursor-pointer border flex items-center justify-center text-3xl font-bold ${cardStyle}`}
              >
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center text-xl ${isRevealed || (isBomb && isGameEnded) ? 'hidden' : 'flex'}`}>
                  {isPlaying ? '⭐' : '🔒'}
                </div>
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center ${isRevealed || (isBomb && isGameEnded) ? 'flex' : 'hidden'}`}>
                  {content}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {message && (
        <div className="w-full bg-zinc-900/80 border border-zinc-800 py-2.5 px-4 rounded-xl text-center shadow-md">
          <p className="text-xs font-bold text-cyan-300 tracking-wide">{message}</p>
        </div>
      )}

      {!isPlaying && (
        <div className="w-full space-y-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/80 backdrop-blur-md">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs text-zinc-400 font-semibold px-1 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Bet Amount (Coins):
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 text-zinc-100 font-black focus:outline-none focus:border-cyan-500 transition-all text-sm shadow-inner"
              placeholder="Enter coins..."
              min="1"
            />
          </div>

          <button
            onClick={startGame}
            disabled={isStarting}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-zinc-950 font-black rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all cursor-pointer text-sm tracking-wide disabled:opacity-50"
          >
            {isStarting ? 'Starting Game...' : 'Start Mines Game 💣'}
          </button>
        </div>
      )}
    </div>
  );
}