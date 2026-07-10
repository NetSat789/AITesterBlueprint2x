import { useState } from 'react';
import MainView from './components/MainView';
import SettingsView from './components/SettingsView';

function App() {
  const [currentView, setCurrentView] = useState<'main' | 'settings'>('main');

  return (
    <div className="flex h-screen w-full bg-neutral-900 text-neutral-100 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-16 flex flex-col items-center py-6 bg-neutral-950 border-r border-neutral-800 shrink-0">
        <button
          onClick={() => setCurrentView('main')}
          className={`p-3 rounded-xl mb-4 transition-colors ${currentView === 'main' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          title="Generator"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className={`p-3 rounded-xl transition-colors ${currentView === 'settings' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          title="Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'main' ? <MainView /> : <SettingsView />}
      </main>
    </div>
  );
}

export default App;
