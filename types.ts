export type SessionMode = 'practice' | 'review' | 'mixed';
export type SessionType = 'sprint' | 'standard' | 'endurance';

export interface Problem {
  id: string; // The "key" e.g., "12x34"
  factorA: number;
  factorB: number;
  solution: number;
}

export interface ProblemResult extends Problem {
  userAnswer: number | null; // null if skipped
  isCorrect: boolean;
  timeTakenMs: number;
}

export interface SessionStats {
  totalProblems: number;
  correctCount: number;
  averageTimeMs: number;
  history: ProblemResult[];
}

export enum AppScreen {
  HOME = 'HOME',
  PRACTICE = 'PRACTICE',
  RESULTS = 'RESULTS',
  LOG = 'LOG',
  STATS = 'STATS',
}

export interface SessionConfig {
  problemCount: number;
  mode: SessionMode;
  forcedProblemIds?: string[]; // For reviewing specific missed items
}

// Database Types
export interface RecentAttempt {
  ts: number;
  correct: boolean;
  timeMs: number;
  userAnswer: number | null;
}

export interface ProblemStats {
  seen: number;
  wrong: number;
  streakCorrect: number;
  lastSeenAt: number;
  lastWrongAt: number | null;
  emaTimeMs: number;
}

export interface ProblemRecord {
  key: string; // "axb"
  a: number;
  b: number;
  recent: RecentAttempt[];
  stats: ProblemStats;
  updatedAt: number;
}

export interface SessionRecord {
  id?: number; // Auto-incremented
  startedAt: number;
  endedAt: number;
  length: number;
  mode: SessionMode;
  sessionType: SessionType;
  correctCount: number;
  avgTimeMs: number;
}