import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export type JobStatus = 'Wishlist' | 'Applied' | 'Follow-up' | 'Interview' | 'Offer' | 'Rejected';

export interface Job {
  id: string;
  companyName: string;
  jobTitle: string;
  linkedInUrl?: string; // Clickable URL
  resumeUsed?: string; // Dropdown or text
  dateApplied: string; // ISO format
  salaryRange?: string; // Optional
  notes?: string; // Optional
  status: JobStatus;
}

interface JobTrackerDB extends DBSchema {
  jobs: {
    key: string;
    value: Job;
    indexes: { 'by-status': JobStatus, 'by-date': string };
  };
}

const DB_NAME = 'job-tracker-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<JobTrackerDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<JobTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('jobs')) {
          const store = db.createObjectStore('jobs', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-date', 'dateApplied');
        }
      },
    });
  }
  return dbPromise;
}

export async function addJob(job: Job) {
  const db = await initDB();
  return db.add('jobs', job);
}

export async function updateJob(job: Job) {
  const db = await initDB();
  return db.put('jobs', job);
}

export async function deleteJob(id: string) {
  const db = await initDB();
  return db.delete('jobs', id);
}

export async function getJob(id: string) {
  const db = await initDB();
  return db.get('jobs', id);
}

export async function getAllJobs() {
  const db = await initDB();
  return db.getAll('jobs');
}

export async function importJobs(jobs: Job[]) {
  const db = await initDB();
  const tx = db.transaction('jobs', 'readwrite');
  for (const job of jobs) {
    tx.store.put(job);
  }
  await tx.done;
}
