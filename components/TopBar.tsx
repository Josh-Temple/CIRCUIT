import React, { useState, useRef, useEffect } from 'react';
import { AppScreen } from '../types';

interface TopBarProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  title?: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ activeScreen, onNavigate, title, subtitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (screen: AppScreen) => {
    onNavigate(screen);
    setIsOpen(false);
  };

  const navItems = [
    { id: AppScreen.HOME, icon: 'sports_score', label: 'Track Day' },
    { id: AppScreen.LOG, icon: 'history', label: 'Telemetry' },
    { id: AppScreen.STATS, icon: 'leaderboard', label: 'Career Stats' },
  ];

  const isHome = activeScreen === AppScreen.HOME;

  return (
    <div className="relative z-50 px-6 pt-6 pb-2 flex items-center justify-between min-h-[80px]">
      {/* Left Section: Back Button (if not Home) */}
      <div className="size-12 flex items-center justify-start z-20">
        {!isHome && (
          <button 
            onClick={() => onNavigate(AppScreen.HOME)}
            className="size-10 rounded-full bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
      </div>

      {/* Center Section: Title */}
      <div className="absolute inset-x-0 top-6 pt-1 flex flex-col items-center justify-center pointer-events-none z-10 h-[56px]">
        {title && <h1 className="text-xl font-display uppercase tracking-wide dark:text-white text-slate-900 leading-none">{title}</h1>}
        {subtitle && <span className="text-xs font-bold text-gray-400 font-sans mt-0.5">{subtitle}</span>}
      </div>

      {/* Right Section: Menu Button */}
      <div ref={menuRef} className="relative size-12 flex items-center justify-end z-20">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`size-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            isOpen 
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg' 
              : 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm hover:shadow-md'
          }`}
        >
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-14 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-stone-100 dark:border-gray-700 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-stone-100 dark:border-gray-700 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu</span>
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    activeScreen === item.id 
                      ? 'bg-terracotta/10 text-terracotta font-bold' 
                      : 'text-slate-700 dark:text-gray-200 hover:bg-stone-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeScreen === item.id ? 'font-variation-fill' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-sans">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};