import { useState } from 'react';

const API_BASE = 'http://127.0.0.1:3001/api';

interface HistoryItem {
  id: string;
  title: string;
  result: string;
}

export default function MainView() {
  const [requirement, setRequirement] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', title: 'Login API Tests', result: '' },
    { id: '2', title: 'Checkout Flow Tests', result: '' }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCurrentResult = () => {
    if (selectedId) {
      const item = history.find(h => h.id === selectedId);
      return item?.result || '';
    }
    return generatedResult;
  };

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    setIsGenerating(true);
    setSelectedId(null);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement })
      });
      const data = await res.json();

      if (data.result) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          title: requirement.substring(0, 30) + (requirement.length > 30 ? '...' : ''),
          result: data.result
        };
        setHistory(prev => [newItem, ...prev]);
        setGeneratedResult(data.result);
      } else {
        setGeneratedResult(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setGeneratedResult('Failed to connect to the backend server. Make sure it is running on port 3001.');
    } finally {
      setIsGenerating(false);
      setRequirement('');
    }
  };

  const handleCopy = () => {
    const result = getCurrentResult();
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  const displayResult = getCurrentResult();

  // Simple markdown-like renderer for Jira-format output
  const renderResult = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ') || line.startsWith('**')) {
        return (
          <p key={i} className="font-semibold text-white mt-4 mb-1">
            {line.replace(/^##\s*/, '').replace(/\*\*/g, '')}
          </p>
        );
      }
      if (line.startsWith('| ') && line.endsWith(' |')) {
        const cells = line.split('|').filter(c => c.trim());
        const isHeader = text.split('\n')[i + 1]?.match(/\|[-| ]+\|/);
        if (isHeader) {
          return (
            <tr key={i}>
              {cells.map((cell, j) => (
                <th key={j} className="border border-neutral-700 px-3 py-2 text-left text-indigo-300 font-semibold bg-neutral-800">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          );
        }
        if (line.match(/\|[-| ]+\|/)) return null;
        return (
          <tr key={i} className="hover:bg-neutral-800/50 transition-colors">
            {cells.map((cell, j) => (
              <td key={j} className="border border-neutral-700 px-3 py-2 text-neutral-300">
                {cell.trim()}
              </td>
            ))}
          </tr>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="text-neutral-300 ml-4 list-disc">
            {line.replace(/^[-*]\s/, '')}
          </li>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-neutral-300 leading-relaxed">{line}</p>;
    });
  };

  const hasTable = displayResult.includes('| ');

  return (
    <div className="flex w-full h-full">
      {/* Left Sidebar: History */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">History</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate ${
                selectedId === item.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-[#0f0f12]">
        {/* Output Display */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full rounded-2xl border border-neutral-800 bg-neutral-900/50 shadow-xl flex flex-col">
            {/* Toolbar */}
            {displayResult && !isGenerating && (
              <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800">
                <span className="text-xs text-neutral-500 font-mono">Jira-format output</span>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex-1 p-6 overflow-y-auto">
              {isGenerating ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-neutral-400 animate-pulse">Generating test cases...</p>
                  </div>
                </div>
              ) : displayResult ? (
                hasTable ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <tbody>
                        {renderResult(displayResult)}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm space-y-0.5">
                    {renderResult(displayResult)}
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-neutral-400 text-sm">Paste a Jira requirement below and hit <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-xs">Ctrl+Enter</kbd> to generate test cases</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-neutral-900 border border-neutral-700 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-lg">
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste Jira requirement here... (Ctrl+Enter to generate)"
              className="px-3 py-2 bg-transparent text-neutral-100 w-full resize-none focus:outline-none placeholder:text-neutral-500 max-h-40 min-h-[44px] text-sm"
              rows={Math.min(5, Math.max(1, requirement.split('\n').length))}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !requirement.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl transition-colors font-medium flex items-center justify-center shrink-0"
              title="Generate (Ctrl+Enter)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-neutral-600 mt-2">Ctrl+Enter to generate · Output formatted for Jira</p>
        </div>
      </div>
    </div>
  );
}
