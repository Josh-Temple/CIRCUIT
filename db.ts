import Dexie, { type Table } from 'dexie';
import { ProblemRecord, SessionRecord } from './types';

// Define the database type shape
export type CommuteMathDB = Dexie & {
  problems: Table<ProblemRecord, string>;
  sessions: Table<SessionRecord, number>;
};

// Initialize Dexie instance directly
const dbInstance = new Dexie('CommuteMathDB') as CommuteMathDB;

// Version 1: Initial
dbInstance.version(1).stores({
  problems: 'key, stats.seen, stats.wrong, updatedAt',
  sessions: '++id, startedAt, mode'
});

// Version 2: Add sessionType index
dbInstance.version(2).stores({
  problems: 'key, stats.seen, stats.wrong, updatedAt',
  sessions: '++id, startedAt, mode, sessionType'
}).upgrade(tx => {
    // Migration not strictly necessary for prototype as we handle missing types gracefully,
    // but good practice to have the block.
    // Existing sessions will have undefined sessionType, which we handle in UI/Logic.
});

export const db = dbInstance;