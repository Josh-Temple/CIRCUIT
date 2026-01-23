import { db } from '../db';
import { ProblemRecord, SessionRecord, SessionType } from '../types';

/**
 * Updates the statistical record for a specific problem after an attempt.
 * Handles EMA calculation, streak updates, and recent history.
 */
export const updateProblemStats = async (
  key: string,
  factorA: number,
  factorB: number,
  isCorrect: boolean,
  timeMs: number,
  userAnswer: number | null
) => {
  await db.transaction('rw', db.problems, async () => {
    const existing = await db.problems.get(key);
    const now = Date.now();
    const alpha = 0.25; // EMA alpha

    const attempt = {
      ts: now,
      correct: isCorrect,
      timeMs,
      userAnswer
    };

    if (existing) {
      const { stats, recent } = existing;
      
      // Update stats
      stats.seen += 1;
      stats.wrong += isCorrect ? 0 : 1;
      stats.streakCorrect = isCorrect ? stats.streakCorrect + 1 : 0;
      stats.lastSeenAt = now;
      if (!isCorrect) stats.lastWrongAt = now;
      
      // Update EMA
      stats.emaTimeMs = stats.emaTimeMs === 0 
        ? timeMs 
        : (alpha * timeMs) + ((1 - alpha) * stats.emaTimeMs);

      // Update recent (keep last 5)
      const newRecent = [attempt, ...recent].slice(0, 5);

      await db.problems.put({
        ...existing,
        recent: newRecent,
        stats,
        updatedAt: now
      });
    } else {
      // Create new record
      const newRecord: ProblemRecord = {
        key,
        a: factorA,
        b: factorB,
        recent: [attempt],
        stats: {
          seen: 1,
          wrong: isCorrect ? 0 : 1,
          streakCorrect: isCorrect ? 1 : 0,
          lastSeenAt: now,
          lastWrongAt: isCorrect ? null : now,
          emaTimeMs: timeMs
        },
        updatedAt: now
      };
      await db.problems.add(newRecord);
    }
  });
};

/**
 * Saves a completed session to the history.
 */
export const saveSession = async (session: SessionRecord) => {
    try {
        await db.sessions.add(session);
    } catch (e) {
        console.error("Failed to save session", e);
        throw e;
    }
};

/**
 * Comparison result for a session against personal bests
 */
export interface RecordComparison {
    isNewRecord: boolean;
    previousBestTimeMs?: number; // For Sprint/Standard
    previousBestCount?: number; // For Endurance
    previousBestAvgPace?: number; // For Endurance
}

/**
 * Checks if the current session is a new record.
 */
export const checkPersonalBest = async (current: SessionRecord): Promise<RecordComparison> => {
    // 1. Fetch all previous sessions of this type
    const history = await db.sessions
        .where('sessionType')
        .equals(current.sessionType)
        .toArray();

    // Filter out the current session ID if it was already saved (just in case), 
    // and filter out invalid runs (e.g. if I bailed early on a Standard run, it shouldn't count as a record attempt unless I finished it?)
    // Actually, saveSession is called at the end. We assume 'current' is the one we just finished.
    // We want to compare against *others*.
    
    const others = history.filter(s => s.id !== current.id);

    if (current.sessionType === 'endurance') {
        // Endurance Record Logic:
        // 1. Most Distance (length)
        // 2. If Distance equal, Best Pace (avgTimeMs lowest)
        
        let bestDistance = 0;
        let bestPaceForDistance = Infinity;

        others.forEach(s => {
            if (s.length > bestDistance) {
                bestDistance = s.length;
                bestPaceForDistance = s.avgTimeMs;
            } else if (s.length === bestDistance) {
                if (s.avgTimeMs < bestPaceForDistance) {
                    bestPaceForDistance = s.avgTimeMs;
                }
            }
        });

        if (others.length === 0) return { isNewRecord: true };

        const isDistanceRecord = current.length > bestDistance;
        const isPaceRecord = current.length === bestDistance && current.avgTimeMs < bestPaceForDistance;

        return {
            isNewRecord: isDistanceRecord || isPaceRecord,
            previousBestCount: bestDistance,
            previousBestAvgPace: bestPaceForDistance === Infinity ? undefined : bestPaceForDistance
        };

    } else {
        // Sprint (5) or Standard (10) Record Logic:
        // Best "Lap Time". Lap Time = avgTimeMs * length (or just total time if we stored it, but we can derive).
        // Note: Use avgTimeMs * length to be consistent.
        // Also, we only count completed runs. A run is completed if length matches the type's target.
        // Sprint = 5, Standard = 10.
        
        const targetLen = current.sessionType === 'sprint' ? 5 : 10;
        
        // If current run wasn't a full completion, it's not a record
        if (current.length < targetLen) return { isNewRecord: false };

        const validOthers = others.filter(s => s.length === targetLen);
        
        if (validOthers.length === 0) return { isNewRecord: true };

        // Find fastest previous total time
        let bestTotalTime = Infinity;
        validOthers.forEach(s => {
            const total = s.avgTimeMs * s.length;
            if (total < bestTotalTime) bestTotalTime = total;
        });

        const currentTotalTime = current.avgTimeMs * current.length;

        return {
            isNewRecord: currentTotalTime < bestTotalTime,
            previousBestTimeMs: bestTotalTime
        };
    }
};