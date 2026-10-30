'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export default function HistoryView() {
  const { user } = useGameStore();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.telegramId) return;
      try {
        const res = await fetch(`/api/history?telegramId=${user.telegramId}`);
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchHistory();
  }, [user]);

  return (
    <div className="space-y-4 pb-6 w-full max-w-sm mx-auto">
      <h2 className="text-sm font-bold text-zinc-200 px-1">Recent Game History</h2>
      <div className="space-y-2.5">
        {history.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
            No games recorded yet.
          </p>
        ) : (
          history.map((item) => (
            <div key={item._id} className="flex justify-between items-center p-3.5 bg-zinc-900/70 backdrop-blur-xl rounded-2xl border border-zinc-800/80 text-xs shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.gameType === 'mines' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                  {item.gameType === 'mines' ? '💣' : '🚀'}
                </div>
                <div>
                  <span className="font-extrabold text-zinc-100 uppercase tracking-wider">{item.gameType}</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Bet: {item.betAmount} Coins</p>
                </div>
              </div>
              <div className={`font-black text-sm ${item.status === 'won' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-red-400'}`}>
                {item.status === 'won' ? `+${item.profit}` : item.profit} Coins
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}