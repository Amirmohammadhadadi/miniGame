'use client';

import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import MinesView from './components/MinesView';
import CrashView from './components/CrashView';
import HistoryView from './components/HistoryView';

export default function HomeMain() {
  const { setUser, isLoadingUser, setLoadingUser, activeTab } = useGameStore();

  useEffect(() => {
    async function initTelegramUser() {
      setLoadingUser(true);
      try {
        let telegramData = {
          telegramId: '123456789',
          firstName: 'Amir',
          username: 'amir_dev',
          photoUrl: '',
        };

        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
          const tgUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
          telegramData = {
            telegramId: tgUser.id.toString(),
            firstName: tgUser.first_name || 'User',
            username: tgUser.username || '',
            photoUrl: tgUser.photo_url || '',
          };
        }

        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(telegramData),
        });

        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoadingUser(false);
      }
    }

    initTelegramUser();
  }, [setUser, setLoadingUser]);

  if (isLoadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-cyan-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
        <p className="text-sm font-medium">Loading Telegram Mini App...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen pb-24 w-full bg-[#090d16] relative selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      <Header />
      <div className="flex-1 px-4 py-6 flex flex-col items-center w-full max-w-lg mx-auto">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'mines' && <MinesView />}
        {activeTab === 'crash' && <CrashView />}
        {activeTab === 'history' && <HistoryView />}
      </div>
      <BottomNav />
    </main>
  );
}