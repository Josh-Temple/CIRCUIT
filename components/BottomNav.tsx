import React from 'react';
import { AppScreen } from '../types';

interface BottomNavProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { id: AppScreen.HOME, icon: 'sports_score', label: 'Track' },
    { id: AppScreen.LOG, icon: 'history', label: 'Telemetry' },
    { id: AppScreen.STATS, icon: 'leaderboard', label: 'Career' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-soft-gray dark:border-white/10 px-8 py-4 flex justify-between items-center pb-8 z-50 max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              isActive 
                ? 'text-terracotta scale-105' 
                : 'text-slate-800 opacity-40 dark:text-white hover:opacity-100'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive ? 'font-variation-fill' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        );
      })}
      
      {/* Placeholder for Settings (Future impl) */}
      <button className="flex flex-col items-center gap-1 text-slate-800 opacity-40 dark:text-white hover:opacity-100 transition-opacity cursor-not-allowed">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">Pit</span>
      </button>
    </nav>
  );
};