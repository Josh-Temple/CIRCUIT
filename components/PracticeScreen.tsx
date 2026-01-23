import React, { useState } from 'react';
import { ProblemResult, SessionConfig } from '../types';
import { Keypad } from './Keypad';
import { useGameLogic } from '../hooks/useGameLogic';

interface PracticeScreenProps {
  config: SessionConfig;
  onComplete: (results: ProblemResult[]) => void;
  onExit: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({ config, onComplete, onExit }) => {
  const {
    loading,
    currentProblem,
    totalProblems,
    currentIndex,
    input,
    isShaking,
    handleKeyPress,
    handleBackspace,
    handleSkip,
    finishSessionEarly
  } = useGameLogic({ config, onComplete });

  const [showConfirm, setShowConfirm] = useState(false);

  const isEndless = config.problemCount === 0;

  if (loading || !currentProblem) {
    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </div>
    );
  }

  const progress = (currentIndex / totalProblems) * 100;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden select-none relative bg-background-light dark:bg-background-dark">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-0" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHUAuBuRFtYNNHUtwG0U35Kg-BGN-lJGT0m5Ya2kU2LKUGWMXkYn5QviSVONUQ_oO5sztNd-JkXrRTvhbyHed4bDUME67szWcgAr5FW9jxOFBZWCUXHOQfbhPXegHzMiD_8e8-rrzKYQjKZyj_nwon5P7YKL-JRmq7HnopB8BqavZNlmhr1mg1UFIC9pkbxtAZrv0eQmbfQC6dke1R11-ycxZy_e00EmXJVGd3QT3l-1VR8ABcbWJk8OjTsLxDiQs67WHofGFZU9U')"}}></div>

      <header className="pt-8 px-6 relative z-10 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onExit}
            className="text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-stone-200/50"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          
          {/* Progress or Count Display */}
          <div className="flex flex-col items-center">
             <span className="text-gray-500 text-sm font-bold tracking-wide font-sans">
               {isEndless ? `Sector ${currentIndex + 1}` : `Sector ${currentIndex + 1} / ${totalProblems}`}
             </span>
             {isEndless && (
                 <span className="text-[10px] text-terracotta font-bold uppercase tracking-widest font-sans">Endurance</span>
             )}
          </div>

          <button 
             onClick={() => setShowConfirm(true)}
             className="text-terracotta hover:text-terracotta/80 transition-colors p-2 -mr-2 rounded-full hover:bg-terracotta/10 flex items-center gap-1"
             title="Finish Lap"
          >
             <span className="material-symbols-outlined text-[24px]">stop_circle</span>
          </button>
        </div>

        {/* Progress Bar (Hidden in Endless Mode) */}
        <div className={`w-full bg-[#e9e7df] dark:bg-gray-800 h-1.5 rounded-full overflow-hidden transition-opacity ${isEndless ? 'opacity-0' : 'opacity-100'}`}>
          <div 
            className="bg-terracotta h-full rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-md mx-auto">
        <div className="text-center w-full">
          <h1 className="text-slate-900 dark:text-white text-[56px] sm:text-[64px] font-display leading-none tracking-tight transition-colors duration-300">
            {currentProblem.factorA} <span className="text-slate-900/40 mx-1">×</span> {currentProblem.factorB}
          </h1>
          
          <div className="pt-10 flex flex-col items-center min-h-[120px]">
            <div className={`relative h-20 w-48 flex items-center justify-center ${isShaking ? 'animate-shake' : ''}`}>
              <div className="flex items-center justify-center space-x-1">
                {input ? (
                   <span className="text-[48px] font-display text-slate-900 dark:text-white tracking-widest">{input}</span>
                ) : (
                   <span className="text-[48px] font-display text-gray-300 dark:text-white/10 tracking-widest">?</span>
                )}
                {/* Cursor animation */}
                <div className="w-[3px] h-10 bg-slate-900/60 animate-pulse rounded-full ml-1"></div>
              </div>
              <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-slate-900/10 rounded-full transition-colors duration-200"></div>
            </div>
            <p className="text-gray-400 text-xs mt-4 font-medium tracking-wide uppercase font-sans">Quick Shift</p>
          </div>
        </div>
      </main>

      <footer className="pb-8 px-6 relative z-10 w-full max-w-md mx-auto">
        <Keypad 
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSkip={handleSkip}
        />
        <div className="mt-8 flex justify-center opacity-40">
            <div className="w-16 h-1 bg-stone-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xs w-full shadow-2xl border border-stone-200 dark:border-gray-700 scale-100 animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-display text-slate-900 dark:text-white mb-2 text-center">Box Box?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm text-center font-medium font-sans">
                    Do you want to end this Lap early and see your results?
                </p>
                <div className="flex flex-col gap-3 font-sans">
                    <button
                        onClick={() => {
                            finishSessionEarly();
                            setShowConfirm(false);
                        }}
                        className="w-full py-3 px-4 rounded-xl font-bold bg-terracotta text-white hover:bg-terracotta/90 transition-colors shadow-lg shadow-terracotta/20"
                    >
                        Confirm Finish
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="w-full py-3 px-4 rounded-xl font-bold bg-transparent text-gray-400 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Keep Racing
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};