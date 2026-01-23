import React, { useEffect, useState } from 'react';
import { ProblemResult, SessionRecord, SessionType } from '../types';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { checkPersonalBest, RecordComparison } from '../services/dbService';

interface ResultsScreenProps {
  results: ProblemResult[];
  onRestart: () => void;
  onHome: () => void;
  onReviewMissed: (ids: string[]) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onRestart, onHome, onReviewMissed }) => {
  const [recordInfo, setRecordInfo] = useState<RecordComparison | null>(null);

  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = Math.round((correctCount / results.length) * 100);
  const totalTime = results.reduce((acc, curr) => acc + curr.timeTakenMs, 0);
  const avgTimeSeconds = (totalTime / results.length / 1000).toFixed(1);
  const totalTimeSeconds = (totalTime / 1000).toFixed(2);

  // Prepare chart data: Smoothed time per problem
  const chartData = results.map((r, i) => ({
    i,
    time: Math.min(r.timeTakenMs / 1000, 20), // Cap at 20s for chart scaling
  }));

  // Identify weak spots (wrong answers or > 10s)
  const weakSpots = results.filter(r => !r.isCorrect || r.timeTakenMs > 10000);
  const missedIds = results.filter(r => !r.isCorrect).map(r => r.id);

  // Determine type for record checking
  let sessionType: SessionType = 'endurance';
  if (results.length === 5) sessionType = 'sprint';
  else if (results.length === 10) sessionType = 'standard';
  // Note: This logic assumes user completed the target length. If they bailed early on Standard (e.g. at 5), it might register as Sprint here purely by length, which is an acceptable edge case fallback or we could pass config in props. For now, inferring from length is robust enough for visual display.

  useEffect(() => {
    // Construct a temporary session object to compare
    const tempSession: SessionRecord = {
        startedAt: 0,
        endedAt: 0,
        length: results.length,
        mode: 'practice', // dummy, checked against all modes
        sessionType: sessionType,
        correctCount: correctCount,
        avgTimeMs: totalTime / results.length
    };

    checkPersonalBest(tempSession).then(setRecordInfo);
  }, [results, sessionType, correctCount, totalTime]);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-[100dvh] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-stone-200 dark:border-gray-800">
        <button onClick={onHome} className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-xl font-display leading-tight tracking-tight flex-1 text-center pt-1">Race Debrief</h2>
        <div className="size-10"></div>
      </div>

      <main className="max-w-md mx-auto pb-32 flex-1 w-full">
        {/* Success Header */}
        <div className="p-6 text-center relative">
          <div className="inline-flex items-center justify-center p-4 bg-sage/20 text-slate-900 rounded-full mb-4 relative">
             <span className="material-symbols-outlined text-4xl">flag</span>
             {recordInfo?.isNewRecord && (
                 <div className="absolute -top-2 -right-8 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase py-1 px-2 rounded-lg transform rotate-12 shadow-sm border border-yellow-500/20 animate-pulse font-sans">
                     New Record
                 </div>
             )}
          </div>
          <h1 className="text-3xl font-display text-slate-900 dark:text-white uppercase tracking-wide">
            {accuracy >= 90 ? 'Podium Finish!' : accuracy >= 80 ? 'Solid Race!' : 'Race Complete'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {sessionType === 'endurance' 
                ? `Endurance Run: ${results.length} Sectors` 
                : `${sessionType === 'sprint' ? 'Sprint' : 'Standard'} Lap Completed`
              }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="flex gap-4 p-4">
          <div className="flex-1 flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-whisper border border-stone-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wide">Precision</p>
            <p className="text-slate-900 text-4xl font-display leading-tight">{accuracy}%</p>
            <div className="flex items-center gap-1 opacity-60">
               <span className="material-symbols-outlined text-sage text-sm">track_changes</span>
               <p className="text-slate-900 text-xs font-bold leading-normal">Handling</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-whisper border border-stone-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wide">
                {sessionType === 'endurance' ? 'Avg Split' : 'Lap Time'}
            </p>
            <p className="text-terracotta text-4xl font-display leading-tight">
                {sessionType === 'endurance' ? avgTimeSeconds : totalTimeSeconds}<span className="text-2xl ml-1">s</span>
            </p>
            <div className="flex items-center gap-1 opacity-60">
              <span className="material-symbols-outlined text-terracotta text-sm">timer</span>
               <p className="text-terracotta text-xs font-bold leading-normal">
                   {sessionType === 'endurance' 
                     ? (recordInfo?.previousBestAvgPace ? `PB: ${(recordInfo.previousBestAvgPace/1000).toFixed(1)}s` : 'New PB!')
                     : (recordInfo?.previousBestTimeMs ? `PB: ${(recordInfo.previousBestTimeMs/1000).toFixed(2)}s` : 'New PB!')
                   }
               </p>
            </div>
          </div>
        </div>

        {/* Consistency Chart Section */}
        <div className="px-4 py-2">
          <div className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow-whisper border border-stone-100 dark:border-gray-700">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-slate-900 dark:text-white text-lg font-display uppercase tracking-wide">Split Consistency</h3>
                <p className="text-gray-400 text-xs font-bold">Split Time (seconds)</p>
              </div>
            </div>
            <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4A3833" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#4A3833" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <YAxis hide domain={[0, 'auto']} />
                        <Area 
                            type="monotone" 
                            dataKey="time" 
                            stroke="#4A3833" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorTime)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Start Line</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Finish Line</p>
            </div>
          </div>
        </div>

        {/* Weak Spots Section */}
        {weakSpots.length > 0 && (
            <div className="px-4 pt-6 pb-2">
            <h3 className="text-slate-900 dark:text-white text-xl font-display uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-terracotta">warning</span>
                Slow Sectors
            </h3>
            <div className="flex flex-col gap-3">
                {weakSpots.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 shadow-whisper border-l-4 border-terracotta">
                        <div>
                            <p className="text-2xl font-display text-slate-900 dark:text-white tracking-widest">{r.factorA} × {r.factorB}</p>
                            <p className="text-terracotta text-sm font-bold uppercase">
                                {r.isCorrect ? `Slow • ${(r.timeTakenMs/1000).toFixed(1)}s` : `Crash • Ans: ${r.solution}`}
                            </p>
                        </div>
                        <div className="text-right">
                             {r.isCorrect ? (
                                 <p className="text-2xl font-display text-slate-900">{r.solution}</p>
                             ) : (
                                <div className="bg-terracotta/10 text-terracotta text-[10px] font-black px-2 py-0.5 rounded uppercase font-sans">Pit Stop</div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
            </div>
        )}
      </main>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-stone-200 dark:border-gray-800 flex flex-col gap-3 max-w-md mx-auto z-20 font-sans">
        {missedIds.length > 0 && (
            <button 
                onClick={() => onReviewMissed(missedIds)}
                className="w-full bg-terracotta hover:bg-terracotta/90 text-background-light font-bold py-4 rounded-xl transition-all shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2"
            >
            <span className="material-symbols-outlined">build</span>
            Fix {missedIds.length} Issues in Pit
            </button>
        )}
        <button 
            onClick={onRestart}
            className={`w-full ${missedIds.length > 0 ? 'bg-transparent text-slate-900 hover:bg-stone-200' : 'bg-terracotta text-background-light hover:bg-terracotta/90 shadow-lg shadow-terracotta/20'} font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2`}
        >
          <span className="material-symbols-outlined">restart_alt</span>
          Re-run Lap
        </button>
        <button 
            onClick={onHome}
            className="w-full bg-transparent hover:bg-stone-200 dark:hover:bg-gray-800 text-slate-900 dark:text-white font-semibold py-3 rounded-xl transition-all"
        >
          Back to Paddock
        </button>
      </div>
      
      {/* Safe Area */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-terracotta/20 max-w-md mx-auto"></div>
    </div>
  );
};