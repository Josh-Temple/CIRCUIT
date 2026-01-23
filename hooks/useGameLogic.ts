import { useState, useEffect, useRef, useCallback } from 'react';
import { Problem, ProblemResult, SessionConfig, SessionRecord, SessionType } from '../types';
import { getSessionProblems, generateProblem } from '../utils/math';
import { updateProblemStats, saveSession } from '../services/dbService';

interface UseGameLogicProps {
  config: SessionConfig;
  onComplete: (results: ProblemResult[]) => void;
}

// Helper for Haptics
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const useGameLogic = ({ config, onComplete }: UseGameLogicProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  const startTimeRef = useRef(Date.now());
  const sessionStartTimeRef = useRef(Date.now());
  const hasMadeMistakeRef = useRef(false);
  const isEndless = config.problemCount === 0;

  // Initial Data Load
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const items = await getSessionProblems(config.problemCount, config.mode, config.forcedProblemIds);
      if (mounted) {
        setProblems(items);
        setLoading(false);
        sessionStartTimeRef.current = Date.now();
        startTimeRef.current = Date.now();
      }
    };
    load();
    return () => { mounted = false; };
  }, [config]);

  // Reset timer and mistake flag on new problem
  useEffect(() => {
    if (!loading && problems.length > 0) {
      startTimeRef.current = Date.now();
      hasMadeMistakeRef.current = false;
      setInput('');
    }
  }, [currentIndex, loading, problems]);

  // Endless Mode: Check if we need to add more problems
  useEffect(() => {
    if (isEndless && !loading && problems.length > 0) {
      // If we are within 5 problems of the end, generate more
      if (currentIndex >= problems.length - 5) {
        const newBatch = Array.from({ length: 10 }, () => generateProblem());
        setProblems(prev => [...prev, ...newBatch]);
      }
    }
  }, [isEndless, currentIndex, loading, problems.length]);

  const finishSession = useCallback(async (finalResults: ProblemResult[]) => {
    if (finalResults.length === 0) {
        onComplete([]);
        return;
    }

    const totalTime = finalResults.reduce((acc, r) => acc + r.timeTakenMs, 0);
    const correctCount = finalResults.filter(r => r.isCorrect).length;
    
    // Determine Session Type
    let sessionType: SessionType = 'endurance';
    if (config.problemCount === 5) sessionType = 'sprint';
    else if (config.problemCount === 10) sessionType = 'standard';
    
    const sessionRec: SessionRecord = {
        startedAt: sessionStartTimeRef.current,
        endedAt: Date.now(),
        length: finalResults.length,
        mode: config.mode,
        sessionType: sessionType,
        correctCount,
        avgTimeMs: totalTime / finalResults.length
    };
    
    await saveSession(sessionRec);
    onComplete(finalResults);
  }, [config.mode, config.problemCount, onComplete]);

  // Public exposed finish function (for manual exit button)
  const finishSessionEarly = useCallback(() => {
      // Finish with currently accumulated results, ignoring the current unfinished one
      finishSession(results);
  }, [results, finishSession]);

  const recordResult = useCallback((userAnswer: number | null, isCorrect: boolean, timeTaken: number) => {
    const currentProblem = problems[currentIndex];
    const result: ProblemResult = {
      ...currentProblem,
      userAnswer,
      isCorrect,
      timeTakenMs: timeTaken,
    };

    const newResults = [...results, result];
    setResults(newResults);

    // Update DB (Fire & Forget)
    updateProblemStats(
      currentProblem.id,
      currentProblem.factorA,
      currentProblem.factorB,
      isCorrect,
      timeTaken,
      userAnswer
    ).catch(err => console.error("Failed to update stats", err));

    if (isEndless) {
        setCurrentIndex((prev) => prev + 1);
    } else {
        if (currentIndex < problems.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            finishSession(newResults);
        }
    }
  }, [problems, currentIndex, results, finishSession, isEndless]);

  const checkAnswer = useCallback((userAnswerStr: string) => {
    const userAnswer = parseInt(userAnswerStr, 10);
    const currentProblem = problems[currentIndex];
    const isMatch = userAnswer === currentProblem.solution;
    const timeTaken = Date.now() - startTimeRef.current;

    if (isMatch) {
       // Correct is only when entered without any mistakes
       const isCleanlyCorrect = !hasMadeMistakeRef.current;
       // Success haptic
       vibrate(10); 
       
       setTimeout(() => {
         recordResult(userAnswer, isCleanlyCorrect, timeTaken);
       }, 150);
    } else {
      hasMadeMistakeRef.current = true;
      setIsShaking(true);
      // Error haptic (double tap)
      vibrate([30, 50, 30]);
      setTimeout(() => {
        setIsShaking(false);
        setInput('');
      }, 400);
    }
  }, [problems, currentIndex, recordResult]);

  const handleKeyPress = useCallback((key: string) => {
    if (loading || isShaking) return;
    if (input.length >= 4) return;
    
    // Light tap haptic
    vibrate(5);
    
    const newInput = input + key;
    setInput(newInput);
    
    // Auto-advance logic
    const currentProblem = problems[currentIndex];
    const solutionStr = currentProblem.solution.toString();
    if (newInput.length === solutionStr.length) {
      checkAnswer(newInput);
    }
  }, [input, loading, isShaking, problems, currentIndex, checkAnswer]);

  const handleBackspace = useCallback(() => {
    vibrate(5);
    setInput((prev) => prev.slice(0, -1));
  }, []);

  const handleSkip = useCallback(() => {
    vibrate(20);
    const timeTaken = Date.now() - startTimeRef.current;
    recordResult(null, false, timeTaken);
  }, [recordResult]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (loading || !problems[currentIndex]) return;

        if (e.key >= '0' && e.key <= '9') {
            handleKeyPress(e.key);
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            handleBackspace();
        } else if (e.key === 'Escape') {
            // Optional: Escape to clear input or trigger pause? 
            // Currently maps to clear input via backspace spam logic, or just ignore.
            // Let's just clear input for now if needed, but Backspace covers it.
        } else if (e.key === 'Enter') {
            // Some users might press Enter out of habit, but we auto-submit.
            // Could map to 'Skip' if input is empty? Let's leave it safe for now.
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress, handleBackspace, loading, problems, currentIndex]);

  return {
    loading,
    currentProblem: problems[currentIndex],
    totalProblems: problems.length,
    currentIndex,
    input,
    isShaking,
    handleKeyPress,
    handleBackspace,
    handleSkip,
    finishSessionEarly
  };
};