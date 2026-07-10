import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Job, JobStatus } from '../lib/db';
import { JobCard } from './JobCard';

interface KanbanColumnProps {
  status: JobStatus;
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, jobs, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'Column', status }
  });

  const getHeaderColor = () => {
    switch (status) {
      case 'Wishlist': return 'bg-gray-100 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300';
      case 'Applied': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Follow-up': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
      case 'Interview': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'Offer': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl min-w-[320px] max-w-[320px] w-[320px] flex-shrink-0 h-full max-h-[calc(100vh-140px)] overflow-hidden border border-gray-200/60 dark:border-gray-700/60 shadow-sm backdrop-blur-sm">
      <div className="p-4 flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md z-10 sticky top-0">
        <h2 className="font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider text-sm">{status}</h2>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${getHeaderColor()}`}>
          {jobs.length}
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 transition-colors hide-scroll-bar ${isOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[150px] pb-4">
            {jobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
