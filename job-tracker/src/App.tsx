import { useState } from 'react';
import { JobProvider, useJobs } from './context/JobContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { JobModal } from './components/JobModal';
import type { Job } from './lib/db';

const AppContent = () => {
  const { addJob, updateJob, deleteJob } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleSaveJob = async (jobData: Omit<Job, 'id' | 'dateApplied'> | Job) => {
    if ('id' in jobData) {
      await updateJob(jobData as Job);
    } else {
      await addJob(jobData);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      await deleteJob(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 overflow-hidden flex flex-col">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onAddJob={() => setIsModalOpen(true)} 
      />
      
      <main className="flex-1 pt-24 pb-6 overflow-hidden">
        <KanbanBoard 
          searchQuery={searchQuery}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJob}
        />
      </main>

      <JobModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveJob}
        initialData={editingJob}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <JobProvider>
        <AppContent />
      </JobProvider>
    </ThemeProvider>
  );
}

export default App;
