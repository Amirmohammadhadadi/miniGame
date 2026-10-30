'use client';

import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Trophy, Gamepad2, Award, TrendingUp, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function HomeView() {
  const { user, setActiveTab } = useGameStore();
  return (
    <div className="space-y-6 pb-6 animate-fadeIn w-full flex flex-col">
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-cyan-950/40 p-6 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden w-full">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-3.5 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Telegram Verified
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">MVP Challenge</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400 font-medium">Total Virtual Balance:</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white tracking-tight">
              {user?.balance?.toLocaleString() || 1000}
            </h2>
            <span className="text-amber-400 font-bold text-sm">Coins</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 w-full">
        <div className="bg-zinc-950/60 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Total Games</span>
          </div>
          <span className="text-xl font-black text-white">{user?.totalGames || 0}</span>
        </div>
        <div className="bg-zinc-950/60 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Total Wins</span>
          </div>
          <span className="text-xl font-black text-emerald-400">{user?.totalWins || 0}</span>
        </div>
        <div className="bg-zinc-950/60 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Total Profit</span>
          </div>
          <span className={`text-xl font-black ${(user?.totalProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {user?.totalProfit || 0}
          </span>
        </div>
        <div className="bg-zinc-950/60 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/80 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Best Multiplier</span>
          </div>
          <span className="text-xl font-black text-purple-400">{user?.bestMultiplier || 1.0}x</span>
        </div>
      </div>

      <div className="space-y-3 w-full">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Select Game to Play</h3>
        <div className="grid grid-cols-1 gap-3.5 w-full">
          <button
            onClick={() => setActiveTab('mines')}
            className="flex items-center justify-between p-4.5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-zinc-900 to-zinc-900 border border-blue-500/30 hover:border-blue-400/60 transition-all group shadow-lg cursor-pointer w-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                💣
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Mines Game</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Find safe tiles and increase your multiplier</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setActiveTab('crash')}
            className="flex items-center justify-between p-4.5 rounded-2xl bg-gradient-to-r from-orange-950/30 via-zinc-900 to-zinc-900 border border-orange-500/30 hover:border-orange-400/60 transition-all group shadow-lg cursor-pointer w-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                🚀
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Crash Game</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Cash out before the rocket crashes</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}