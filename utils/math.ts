import { Problem, ProblemRecord, SessionMode } from '../types';
import { db } from '../db';

// --- Constants for SRS (Spaced Repetition System) Scoring ---
const SCORE_WEIGHTS = {
  ERROR_RATE: 50,      // Heavily penalize errors
  RECENCY_SHORT: 20,   // Review very recently wrong items
  RECENCY_MED: 10,     // Review moderately recently wrong items
  SLOW_SPEED: 15,      // Review items that take too long (>8s)
  STREAK_PENALTY: 5,   // Reduce score if consistently correct
  MAX_STREAK_PENALTY: 30,
  MIN_SCORE_THRESHOLD: 10, // Minimum score to be considered "weak"
};

// Generate a random problem ID "AxB"
const generateRandomPair = (): { a: number; b: number; key: string } => {
  const a = Math.floor(Math.random() * (99 - 11 + 1)) + 11;
  const b = Math.floor(Math.random() * (99 - 11 + 1)) + 11;
  return { a, b, key: `${a}x${b}` };
};

export const generateProblemFromPair = (a: number, b: number): Problem => {
  return {
    id: `${a}x${b}`,
    factorA: a,
    factorB: b,
    solution: a * b,
  };
};

export const generateProblem = (): Problem => {
  const { a, b } = generateRandomPair();
  return generateProblemFromPair(a, b);
};

// Selection logic
export const getSessionProblems = async (count: number, mode: SessionMode, forcedIds?: string[]): Promise<Problem[]> => {
  // If count is 0 (Infinity mode), we start with a batch of 20
  const actualCount = count === 0 ? 20 : count;

  // 1. Handle forced IDs (e.g. "Review Missed")
  if (forcedIds && forcedIds.length > 0) {
    return forcedIds.map(id => {
      const [aStr, bStr] = id.split('x');
      return generateProblemFromPair(parseInt(aStr), parseInt(bStr));
    });
  }

  // 2. Handle pure practice (random)
  if (mode === 'practice') {
    return Array.from({ length: actualCount }, () => generateProblem());
  }

  // 3. Handle Review/Mixed modes (Smart Selection)
  const allRecords = await db.problems.toArray();

  const calculateWeakness = (p: ProblemRecord) => {
    const errorRate = p.stats.seen > 0 ? (p.stats.wrong / p.stats.seen) : 0;
    
    const daysSinceWrong = p.stats.lastWrongAt 
      ? (Date.now() - p.stats.lastWrongAt) / (1000 * 60 * 60 * 24) 
      : 100; // Default large if never wrong
    
    // Calculate Score Components
    const errorScore = errorRate * SCORE_WEIGHTS.ERROR_RATE;
    
    let recencyScore = 0;
    if (daysSinceWrong < 2) recencyScore = SCORE_WEIGHTS.RECENCY_SHORT;
    else if (daysSinceWrong < 7) recencyScore = SCORE_WEIGHTS.RECENCY_MED;
    
    const speedScore = p.stats.emaTimeMs > 8000 ? SCORE_WEIGHTS.SLOW_SPEED : 0;

    // Reduce score if on a streak (we know it well)
    const streakPenalty = Math.min(
      p.stats.streakCorrect * SCORE_WEIGHTS.STREAK_PENALTY, 
      SCORE_WEIGHTS.MAX_STREAK_PENALTY
    );

    return errorScore + recencyScore + speedScore - streakPenalty;
  };

  // Filter and sort candidates
  const candidates = allRecords
    .map(r => ({ ...r, score: calculateWeakness(r) }))
    .filter(r => r.score > SCORE_WEIGHTS.MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  const reviewCount = mode === 'review' 
    ? actualCount 
    : Math.floor(actualCount * 0.3); // Mixed: ~30% review

  const reviewProblems: Problem[] = [];
  
  // Pick top review candidates (add randomness to prevent identical ordering)
  // We look at the top 2*N candidates and pick N randomly from them
  const poolSize = Math.max(reviewCount * 2, 10);
  const topCandidates = candidates.slice(0, poolSize);
  
  // Shuffle top candidates to pick from pool
  const shuffledCandidates = [...topCandidates].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < reviewCount && i < shuffledCandidates.length; i++) {
    const rec = shuffledCandidates[i];
    reviewProblems.push(generateProblemFromPair(rec.a, rec.b));
  }

  // Fill remaining with random practice
  const neededRandom = actualCount - reviewProblems.length;
  const randomProblems = Array.from({ length: neededRandom }, () => generateProblem());

  // Shuffle final combined result
  return [...reviewProblems, ...randomProblems].sort(() => Math.random() - 0.5);
};