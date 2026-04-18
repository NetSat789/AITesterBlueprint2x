import { useState, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:3001/api';

export default function SettingsView() {
  const [configs, setConfigs] = useState({
    ollamaUrl: 'http://127.0.0.1:11434',
    ollamaModel: '',
    groqKey: '',
    openaiKey: '',
    geminiKey: '',
    claudeKey: '',
    provider: 'ollama'
  });
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(data => {
        setConfigs(prev => ({ ...prev, ...data }));
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Fetch Ollama models whenever ollamaUrl changes or provider is ollama
  useEffect(() => {
    if (configs.provider === 'ollama') {
      fetch(`${API_BASE}/ollama-models`)
        .then(res => res.json())
        .then(data => {
          const models: string[] = data.models || [];
          setOllamaModels(models);
          // Auto-select first model if none selected
          if (models.length > 0 && !configs.ollamaModel) {
            setConfigs(prev => ({ ...prev, ollamaModel: models[0] }));
          }
        })
        .catch(() => setOllamaModels([]));
    }
  }, [configs.provider, configs.ollamaUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setConfigs({ ...configs, [e.target.name]: e.target.value });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      if (configs.provider === 'ollama') {
        const res = await fetch(`${API_BASE}/ollama-models`);
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          alert(`Connection successful!\nFound ${data.models.length} model(s): ${data.models.join(', ')}`);
        } else {
          alert('Connected to Ollama, but no models found.\nRun: ollama pull mistral');
        }
      } else {
        alert('Connection successful!');
      }
    } catch {
      alert('Connection failed! Check the URL and try again.');
    }
    setIsTesting(false);
  };

  const handleSave = async () => {
    try {
      await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configs)
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  if (isLoading) return <div className="p-8 text-white">Loading configs...</div>;

  return (
    <div className="flex-1 bg-[#0f0f12] overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configurations</h1>
          <p className="text-neutral-400">Manage your LLM endpoint connections and API keys.</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Active Provider */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">Active Provider</label>
            <select
              name="provider"
              value={configs.provider}
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="groq">Groq API</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <hr className="border-neutral-800" />

          {/* Ollama Settings */}
          {configs.provider === 'ollama' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">Ollama API URL</label>
                <input
                  type="text"
                  name="ollamaUrl"
                  value={configs.ollamaUrl}
                  onChange={handleChange}
                  placeholder="http://localhost:11434"
                  className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Ollama Model
                  {ollamaModels.length === 0 && (
                    <span className="ml-2 text-xs text-amber-400">⚠ No models detected</span>
                  )}
                </label>
                {ollamaModels.length > 0 ? (
                  <select
                    name="ollamaModel"
                    value={configs.ollamaModel}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    {ollamaModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="ollamaModel"
                    value={configs.ollamaModel}
                    onChange={handleChange}
                    placeholder="e.g. llama3.2, mistral, deepseek-r1"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                )}
                {ollamaModels.length === 0 && (
                  <p className="text-xs text-neutral-500">Make sure Ollama is running, then click <strong className="text-neutral-400">Test Connection</strong> to reload models.</p>
                )}
              </div>
            </div>
          )}

          {/* Groq Settings */}
          {configs.provider === 'groq' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">Groq API Key</label>
              <input
                type="password"
                name="groqKey"
                value={configs.groqKey}
                onChange={handleChange}
                placeholder="gsk_..."
                className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          )}

          {/* OpenAI Settings */}
          {configs.provider === 'openai' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">OpenAI API Key</label>
              <input
                type="password"
                name="openaiKey"
                value={configs.openaiKey}
                onChange={handleChange}
                placeholder="sk-..."
                className="w-full bg-neutral-950 border border-neutral-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end items-center">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-3 text-white rounded-xl font-medium shadow-lg transition-all ${
              saveStatus === 'saved'
                ? 'bg-green-600 shadow-green-500/20'
                : saveStatus === 'error'
                ? 'bg-red-600 shadow-red-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            {saveStatus === 'saved' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Error' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
