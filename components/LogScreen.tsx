import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { AppScreen, SessionMode } from '../types';
import { TopBar } from './TopBar';

interface LogScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

export const LogScreen: React.FC<LogScreenProps> = ({ onNavigate }) => {
  const sessions = useLiveQuery(() => 
    db.sessions.orderBy('startedAt').reverse().limit(50).toArray()
  );

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModeIcon = (mode: SessionMode) => {
    switch (mode) {
      case 'practice': return 'sports_score'; // Track Day
      case 'review': return 'build'; // Tech Corner
      case 'mixed': return 'flag'; // Grand Prix
      default: return 'sports_score';
    }
  };

  const getModeLabel = (mode: SessionMode) => {
    switch (mode) {
      case 'practice': return 'Track Day';
      case 'review': return 'Tech Corner';
      case 'mixed': return 'Grand Prix';
      default: return 'Track Day';
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-light dark:bg-background-dark font-sans">
      <TopBar 
        activeScreen={AppScreen.LOG} 
        onNavigate={onNavigate} 
        title="Race Telemetry" 
        subtitle="Recent Laps"
      />

      <main className="flex-1 px-4 space-y-3 pb-8 mt-4">
        {!sessions ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
            <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
            <p className="font-bold text-lg dark:text-white">No races yet</p>
            <p className="text-sm">Complete a track day to see data here.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id} 
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-whisper border border-gray-50 dark:border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-full flex items-center justify-center ${
                  session.mode === 'review' ? 'bg-terracotta/10 text-terracotta' : 
                  session.mode === 'mixed' ? 'bg-primary/10 text-primary' : 'bg-sage/10 text-sage'
                }`}>
                  <span className="material-symbols-outlined">{getModeIcon(session.mode)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      {getModeLabel(session.mode)}
                    </span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{formatDate(session.startedAt)}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-display text-2xl dark:text-white pt-1">
                      {Math.round((session.correctCount / session.length) * 100)}%
                    </span>
                    <span className="text-xs text-gray-400">precision</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-soft-gray dark:bg-white/5 px-2 py-1 rounded text-xs font-bold text-gray-600 dark:text-gray-300">
                  {session.correctCount}/{session.length}
                </div>
                <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                  {(session.avgTimeMs / 1000).toFixed(1)}s avg split
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};