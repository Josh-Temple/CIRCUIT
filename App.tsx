import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { LogScreen } from './components/LogScreen';
import { StatsScreen } from './components/StatsScreen';
import { AppScreen, SessionConfig, ProblemResult } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({ problemCount: 10, mode: 'practice' });
  const [sessionResults, setSessionResults] = useState<ProblemResult[]>([]);

  const handleStartSession = (config: SessionConfig) => {
    setSessionConfig(config);
    setCurrentScreen(AppScreen.PRACTICE);
  };

  const handleSessionComplete = (results: ProblemResult[]) => {
    setSessionResults(results);
    setCurrentScreen(AppScreen.RESULTS);
  };

  const handleExitSession = () => {
    setCurrentScreen(AppScreen.HOME);
  };

  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  const handleRestart = () => {
    // Restart with same config but clear forced Ids if any (start fresh session)
    setSessionConfig({ ...sessionConfig, forcedProblemIds: undefined });
    setCurrentScreen(AppScreen.PRACTICE);
  };

  const handleReviewMissed = (ids: string[]) => {
    setSessionConfig({
      problemCount: ids.length,
      mode: 'review', // Technically immediate review
      forcedProblemIds: ids
    });
    setCurrentScreen(AppScreen.PRACTICE);
  };

  return (
    <>
      {currentScreen === AppScreen.HOME && (
        <HomeScreen onStart={handleStartSession} onNavigate={handleNavigate} />
      )}
      {currentScreen === AppScreen.LOG && (
        <LogScreen onNavigate={handleNavigate} />
      )}
      {currentScreen === AppScreen.STATS && (
        <StatsScreen onNavigate={handleNavigate} />
      )}
      {currentScreen === AppScreen.PRACTICE && (
        <PracticeScreen 
            config={sessionConfig} 
            onComplete={handleSessionComplete}
            onExit={handleExitSession}
        />
      )}
      {currentScreen === AppScreen.RESULTS && (
        <ResultsScreen 
            results={sessionResults} 
            onRestart={handleRestart}
            onHome={handleExitSession}
            onReviewMissed={handleReviewMissed}
        />
      )}
    </>
  );
};

export default App;