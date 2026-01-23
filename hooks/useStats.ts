import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

/**
 * Hook to get statistics for the current day and streak.
 */
export const useTodayStats = () => {
  return useLiveQuery(async () => {
    // 1. Today's Laps
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    
    // Count sessions today
    const todaySessionsCount = await db.sessions
        .where('startedAt')
        .above(todayTs)
        .count();

    // 2. Streak Calculation
    // Get all session timestamps to determine unique days played
    const timestamps = await db.sessions.orderBy('startedAt').keys();
    const uniqueDays = new Set<string>();
    
    timestamps.forEach((ts) => {
        if (typeof ts === 'number') {
            uniqueDays.add(new Date(ts).toDateString());
        }
    });

    const d = new Date();
    const tStr = d.toDateString();
    d.setDate(d.getDate() - 1);
    const yStr = d.toDateString();
    
    let loopDate = new Date();
    let currentStreak = 0;
    
    // Determine start point for streak check
    // If played today, start counting from today backwards.
    // If NOT played today but played yesterday, streak is still alive, start from yesterday.
    // Otherwise streak is broken (0).
    if (uniqueDays.has(tStr)) {
        // Start from today (loopDate is already today)
    } else if (uniqueDays.has(yStr)) {
        // Start from yesterday
        loopDate.setDate(loopDate.getDate() - 1);
    } else {
        return {
            todayLaps: todaySessionsCount,
            currentStreak: 0
        };
    }
    
    // Count consecutive days backwards
    while (uniqueDays.has(loopDate.toDateString())) {
        currentStreak++;
        loopDate.setDate(loopDate.getDate() - 1);
    }

    return {
      todayLaps: todaySessionsCount,
      currentStreak
    };
  }, []) ?? { todayLaps: 0, currentStreak: 0 };
};

/**
 * Hook to calculate global lifetime statistics and identify weak spots.
 */
export const useGlobalStats = () => {
  return useLiveQuery(async () => {
    const [problems, sessions] = await Promise.all([
        db.problems.toArray(),
        db.sessions.toArray()
    ]);

    // Aggregate Stats
    const totalSessions = sessions.length;
    const totalSolved = sessions.reduce((acc, s) => acc + s.length, 0);
    const globalCorrect = sessions.reduce((acc, s) => acc + s.correctCount, 0);
    const globalAccuracy = totalSolved > 0 ? Math.round((globalCorrect / totalSolved) * 100) : 0;
    
    // Calculate global average speed from sessions (weighted by session length)
    const weightedTimeSum = sessions.reduce((acc, s) => acc + (s.avgTimeMs * s.length), 0);
    const globalAvgSpeed = totalSolved > 0 ? weightedTimeSum / totalSolved : 0;

    // Weakest Problems: High error rate OR very slow
    const weakest = problems
      .map(p => {
        const errorRate = p.stats.seen > 0 ? (p.stats.wrong / p.stats.seen) : 0;
        // Simple weakness score: Error Rate * 70% + Speed Penalty * 30%
        // Normalize speed: >10s is bad.
        const speedPenalty = Math.min(Math.max(p.stats.emaTimeMs - 5000, 0) / 5000, 1);
        const score = (errorRate * 0.7) + (speedPenalty * 0.3);
        return { ...p, weaknessScore: score, errorRate };
      })
      .filter(p => p.stats.seen > 0 && p.weaknessScore > 0.1) // Only show actually weak items
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 5);

    return {
      totalSessions,
      totalSolved,
      globalAccuracy,
      globalAvgSpeed,
      weakest
    };
  }, []);
};