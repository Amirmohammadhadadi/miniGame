'use client';

import React from 'react';
import { useGameStore } from '../store/useGameStore';

export default function Header() {
  const { user } = useGameStore();
  return (
    <div className="flex items-center justify-between bg-zinc-950/80 backdrop-blur-xl px-4 py-3.5 border-b border-zinc-800/60 sticky top-0 z-40 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.3)] flex-shrink-0">
          <div className="w-full h-full bg-zinc-950 rounded-[15px] flex items-center justify-center font-black text-cyan-400 text-base">
            {user?.firstName?.[0] || 'U'}
          </div>
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-zinc-100 truncate">{user?.firstName || 'Telegram User'}</h1>
          <p className="text-[11px] text-zinc-400 font-medium truncate">@{user?.username || 'telegram_user'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-zinc-900/90 px-3.5 py-1.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex-shrink-0">
        <span className="text-amber-400 text-sm animate-pulse">🪙</span>
        <span className="text-cyan-300 font-black text-sm tracking-wide">
          {user?.balance?.toLocaleString() || 1000} <span className="text-[10px] text-zinc-400 font-normal">Coins</span>
        </span>
      </div>
    </div>
  );
}