import React, { useRef } from 'react';
import { useJobs } from '../context/JobContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Download, Upload, Plus, Briefcase } from 'lucide-react';
import type { Job } from '../lib/db';

interface HeaderProps {
  onAddJob: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddJob, searchQuery, setSearchQuery }) => {
  const { jobs, importJobsData } = useJobs();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "jobs_export_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const validJobs = json.filter(j => j.id && j.companyName && j.jobTitle && j.status);
          await importJobsData(validJobs as Job[]);
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 py-4 px-6 fixed top-0 w-full z-10 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <Briefcase size={28} />
          <h1 className="text-xl font-bold dark:text-white text-gray-900 tracking-tight">Job Tracker</h1>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input 
              type="text" 
              placeholder="Search company or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          <button onClick={toggleTheme} title="Toggle Theme" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
            <button onClick={handleExport} title="Export JSON" className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all shadow-sm">
              <Download size={18} />
            </button>
            <button onClick={() => fileInputRef.current?.click()} title="Import JSON" className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all hover:shadow-sm">
              <Upload size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>

          <button onClick={onAddJob} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
