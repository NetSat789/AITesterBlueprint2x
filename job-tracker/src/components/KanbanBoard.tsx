import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Job, JobStatus } from '../lib/db';
import { useJobs } from '../context/JobContext';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';

const COLUMNS: JobStatus[] = ['Wishlist', 'Applied', 'Follow-up', 'Interview', 'Offer', 'Rejected'];

interface KanbanBoardProps {
  searchQuery: string;
  onEditJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ searchQuery, onEditJob, onDeleteJob }) => {
  const { jobs, moveJob } = useJobs();
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredJobs = jobs.filter(job => 
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = filteredJobs.find(j => j.id === active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;

    const activeData = active.data.current;
    if (activeData?.type !== 'Job') return;

    const activeJob = activeData.job as Job;
    const overData = over.data.current;
    
    let newStatus: JobStatus;
    if (overData?.type === 'Column') {
      newStatus = overData.status;
    } else if (overData?.type === 'Job') {
      newStatus = overData.job.status;
    } else {
      return;
    }

    if (activeJob.status !== newStatus) {
      moveJob(activeId as string, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-4 hide-scroll-bar px-6">
        {COLUMNS.map(status => (
          <KanbanColumn 
            key={status} 
            status={status} 
            jobs={filteredJobs.filter(j => j.status === status).sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())}
            onEdit={onEditJob}
            onDelete={onDeleteJob}
          />
        ))}
      </div>

      <DragOverlay>
        {activeJob ? <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
