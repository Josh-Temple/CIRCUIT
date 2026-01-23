import React from 'react';
import { AppScreen } from '../types';
import { TopBar } from './TopBar';
import { useGlobalStats } from '../hooks/useStats';

interface StatsScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onNavigate }) => {
  const stats = useGlobalStats();

  if (!stats) return null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-light dark:bg-background-dark font-sans">
      <TopBar 
        activeScreen={AppScreen.STATS} 
        onNavigate={onNavigate} 
        title="Driver Profile" 
        subtitle="Career Stats"
      />

      <main className="flex-1 px-4 space-y-6 pb-8 mt-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-whisper border border-gray-50 dark:border-gray-700">
            <div className="text-sage mb-2">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <p className="text-4xl font-display text-slate-900 dark:text-white">{stats.globalAccuracy}%</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Precision</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-whisper border border-gray-50 dark:border-gray-700">
            <div className="text-primary mb-2">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <p className="text-4xl font-display text-slate-900 dark:text-white">
              {(stats.globalAvgSpeed / 1000).toFixed(1)}<span className="text-xl ml-0.5 font-sans font-bold">s</span>
            </p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg Split</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-whisper border border-gray-50 dark:border-gray-700">
            <div className="text-terracotta mb-2">
              <span className="material-symbols-outlined">functions</span>
            </div>
            <p className="text-4xl font-display text-slate-900 dark:text-white">{stats.totalSolved}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sectors Cleared</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-whisper border border-gray-50 dark:border-gray-700">
             <div className="text-gray-400 mb-2">
              <span className="material-symbols-outlined">local_fire_department</span>
            </div>
            <p className="text-4xl font-display text-slate-900 dark:text-white">{stats.totalSessions}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Laps Completed</p>
          </div>
        </div>

        {/* Weakest Links Section */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-2">
             <span className="material-symbols-outlined text-terracotta">warning</span>
             <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Engine Mapping</h2>
          </div>
          
          <div className="space-y-3">
            {stats.weakest.length === 0 ? (
               <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-50 dark:border-gray-700 text-center">
                  <p className="text-gray-400 text-sm">No issues found. Your machine is running perfectly!</p>
               </div>
            ) : (
                stats.weakest.map((p) => (
                <div key={p.key} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-whisper border border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-terracotta/10 flex items-center justify-center text-terracotta font-bold text-sm">
                        !
                    </div>
                    <div>
                        <p className="text-2xl font-display text-slate-900 dark:text-white tracking-widest pt-1">
                            {p.a} × {p.b}
                        </p>
                    </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-terracotta">
                            {Math.round(p.errorRate * 100)}% Err
                        </p>
                        <p className="text-xs text-gray-400">
                            {(p.stats.emaTimeMs / 1000).toFixed(1)}s avg
                        </p>
                    </div>
                </div>
                ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};