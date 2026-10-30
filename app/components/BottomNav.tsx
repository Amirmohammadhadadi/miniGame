'use client';

import React from 'react';
import { useGameStore, TabType } from '../store/useGameStore';
import { Home, Bomb, TrendingUp, History } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useGameStore();
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'home', label: 'Profile', icon: Home },
    { id: 'mines', label: 'Mines', icon: Bomb },
    { id: 'crash', label: 'Crash', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-800/80 px-4 py-2.5 flex justify-around items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all cursor-pointer ${
              isActive
                ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-105'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}