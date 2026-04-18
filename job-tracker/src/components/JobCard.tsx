import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../lib/db';
import { ExternalLink, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id, data: { type: 'Job', job } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysSince = formatDistanceToNow(new Date(job.dateApplied), { addSuffix: true });

  const getStatusColor = () => {
    switch (job.status) {
      case 'Wishlist': return 'border-gray-400 dark:border-gray-500';
      case 'Applied': return 'border-blue-500';
      case 'Follow-up': return 'border-purple-500';
      case 'Interview': return 'border-yellow-500';
      case 'Offer': return 'border-green-500';
      case 'Rejected': return 'border-red-500';
      default: return 'border-gray-200';
    }
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="opacity-50 border-2 border-dashed border-indigo-400 rounded-xl p-4 bg-indigo-50 dark:bg-indigo-900/20 h-[140px] mb-3"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] hover:shadow-lg border border-gray-100 dark:border-gray-700 border-l-4 ${getStatusColor()} transition-all cursor-grab active:cursor-grabbing mb-3 block`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-12">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-base leading-tight mb-1" title={job.jobTitle}>
            {job.jobTitle}
          </h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate" title={job.companyName}>
            {job.companyName}
          </p>
        </div>
        {job.linkedInUrl && (
          <a
            href={job.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onPointerDown={(e) => e.stopPropagation()}
            title="View Job Post"
          >
            <ExternalLink size={18} />
          </a>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {job.resumeUsed && (
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 w-fit px-2 py-1 rounded-md">
            <FileText size={13} />
            <span className="truncate max-w-[150px]">{job.resumeUsed}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400" />
          <span>Applied {daysSince}</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/95 dark:bg-gray-800/95 rounded-md backdrop-blur-sm shadow-sm border border-gray-100 dark:border-gray-700">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(job); }}
          className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          title="Edit Job"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
          title="Delete Job"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
