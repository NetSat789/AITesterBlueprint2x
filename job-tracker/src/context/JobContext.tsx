import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAllJobs, addJob as addJobDb, updateJob as updateJobDb, deleteJob as deleteJobDb, importJobs as importJobsDb } from '../lib/db';
import type { Job, JobStatus } from '../lib/db';

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'dateApplied'>) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  moveJob: (id: string, newStatus: JobStatus) => Promise<void>;
  importJobsData: (jobs: Job[]) => Promise<void>;
  isLoading: boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'dateApplied'>) => {
    const newJob: Job = {
      ...jobData,
      id: crypto.randomUUID(),
      dateApplied: new Date().toISOString(),
    };
    await addJobDb(newJob);
    setJobs((prev) => [...prev, newJob]);
  };

  const updateJob = async (updatedJob: Job) => {
    await updateJobDb(updatedJob);
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  const deleteJob = async (id: string) => {
    await deleteJobDb(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const moveJob = async (id: string, newStatus: JobStatus) => {
    const job = jobs.find((j) => j.id === id);
    if (!job || job.status === newStatus) return;

    const updatedJob = { ...job, status: newStatus };
    setJobs((prev) => prev.map((j) => (j.id === id ? updatedJob : j)));
    
    try {
      await updateJobDb(updatedJob);
    } catch(err) {
      setJobs((prev) => prev.map((j) => (j.id === id ? job : j)));
      console.error('Failed to move job:', err);
    }
  };

  const importJobsData = async (newJobs: Job[]) => {
    await importJobsDb(newJobs);
    await loadJobs();
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob, moveJob, importJobsData, isLoading }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
