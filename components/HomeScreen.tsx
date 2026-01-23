import React, { useState } from 'react';
import { SessionConfig, SessionMode, AppScreen } from '../types';
import { TopBar } from './TopBar';
import { useTodayStats } from '../hooks/useStats';

interface HomeScreenProps {
  onStart: (config: SessionConfig) => void;
  onNavigate: (screen: AppScreen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onNavigate }) => {
  const [problemCount, setProblemCount] = useState(10);
  const [selectedMode, setSelectedMode] = useState<SessionMode>('practice');
  const { todayLaps, currentStreak } = useTodayStats();

  // Length definitions (20 removed)
  const counts = [5, 10, 0];
  const activeCountIndex = counts.indexOf(problemCount);

  // Helper to get definition text
  const getTypeDefinition = () => {
      if (problemCount === 5) return "Sprint: 5 Sectors";
      if (problemCount === 10) return "Standard: 10 Sectors";
      return "Endurance: ∞ Sectors";
  };
  
  const getModeDescription = () => {
    switch (selectedMode) {
        case 'practice': return "Track Day: Random double-digit circuit";
        case 'review': return "Tech Corner: Targeting slow corners & misses";
        case 'mixed': return "Grand Prix: 70% New • 30% Tech Review";
        default: return "";
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background-light dark:bg-background-dark overflow-hidden relative">
      <TopBar activeScreen={AppScreen.HOME} onNavigate={onNavigate} />

      {/* Main Content Area - Centered Title & Stats */}
      <main className="flex-1 flex flex-col items-center justify-center -mt-10 px-6 relative z-0">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-[5rem] leading-none tracking-tighter dark:text-white text-slate-900 font-display">
            CIRCUIT
          </h1>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-terracotta font-sans">
            Calculations in Rapid Cycle<br/>& Intensive Training
          </p>
        </div>

        {/* Mini Stats Pill - Icon Based */}
        <div className="inline-flex items-center gap-5 bg-white dark:bg-white/10 px-6 py-3 rounded-full shadow-whisper border border-stone-100 dark:border-white/5 mb-8 backdrop-blur-md">
            {/* Today's Laps (Flag) */}
            <div className="flex items-center gap-2" title="Laps Today">
                <span className="material-symbols-outlined text-sage">sports_score</span>
                <span className="text-xl font-display text-slate-900 dark:text-white tracking-tight">{todayLaps}</span>
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-stone-200 dark:bg-white/10"></div>

            {/* Streak (Fire) */}
            <div className="flex items-center gap-2" title="Day Streak">
                 <span className="material-symbols-outlined text-terracotta">local_fire_department</span>
                 <span className="text-xl font-display text-slate-900 dark:text-white tracking-tight">
                    {currentStreak}<span className="text-sm font-bold font-sans text-gray-400 ml-0.5">d</span>
                 </span>
            </div>
        </div>
      </main>

      {/* Bottom Configuration & Action Area */}
      <section className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-stone-200/50 dark:border-white/5 rounded-t-[2.5rem] p-6 pb-8 space-y-6">
        
        {/* Settings Row */}
        <div className="flex gap-3 h-12">
            {/* Mode Selector - Dropdown */}
            <div className="w-[140px] shrink-0 relative">
                 <select 
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value as SessionMode)}
                    className="w-full h-full appearance-none bg-white dark:bg-gray-800 border-0 rounded-2xl pl-4 pr-10 text-sm font-bold text-slate-900 dark:text-white shadow-sm ring-1 ring-stone-200 dark:ring-gray-700 focus:ring-2 focus:ring-terracotta transition-shadow font-sans"
                >
                    <option value="practice">Track Day</option>
                    <option value="review">Tech Corner</option>
                    <option value="mixed">Grand Prix</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
            </div>

            {/* Length Selector - Animated Tabs */}
            <div className="flex-1 relative bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm ring-1 ring-stone-200 dark:ring-gray-700 flex">
                {/* Sliding Background Pill */}
                <div 
                    className="absolute top-1 bottom-1 bg-slate-900 dark:bg-terracotta rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm"
                    style={{ 
                        left: `calc(0.25rem + ${activeCountIndex * 33.33}%)`, 
                        width: 'calc(33.33% - 0.5rem)' 
                    }}
                />
                
                {counts.map((count) => (
                    <button
                        key={count}
                        onClick={() => setProblemCount(count)}
                        className={`flex-1 relative z-10 text-sm font-display transition-colors duration-200 ${
                            problemCount === count 
                            ? 'text-white' 
                            : 'text-gray-400 hover:text-slate-600 dark:hover:text-gray-200'
                        }`}
                    >
                        {count === 0 ? '∞' : count}
                    </button>
                ))}
            </div>
        </div>

        {/* Description Text */}
        <div className="text-center h-4 flex flex-col items-center justify-center">
             <p className="text-[10px] text-gray-500 dark:text-gray-300 font-bold uppercase tracking-wide mb-1 font-sans">
                 {getTypeDefinition()}
             </p>
             <p className="text-[10px] text-gray-400 font-medium font-sans">
                {getModeDescription()}
             </p>
        </div>

        {/* Start Button */}
        <button
            onClick={() => onStart({ problemCount, mode: selectedMode })}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-background-light h-16 rounded-2xl shadow-lg shadow-terracotta/20 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
        >
            <span className="material-symbols-outlined text-3xl">sports_score</span>
            <span className="text-2xl font-display tracking-wide pt-1">Start Engine</span>
        </button>
      </section>
    </div>
  );
};