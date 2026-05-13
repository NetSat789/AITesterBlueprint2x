import { useState } from 'react';
import { Settings, Play, CheckCircle, AlertCircle, Loader2, Download, Copy } from 'lucide-react';
import Papa from 'papaparse';

function App() {
  const [credentials, setCredentials] = useState({ base_url: '', email: '', api_token: '' });
  const [llmKey, setLlmKey] = useState('');
  const [issueId, setIssueId] = useState('');
  const [template, setTemplate] = useState('Functional');
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, testing, success, error
  const [issueData, setIssueData] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/jira/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) throw new Error('Connection failed');
      setConnectionStatus('success');
    } catch (e) {
      setConnectionStatus('error');
      setErrorMsg(e.message);
    }
  };

  const handleFetchIssue = async () => {
    if (!issueId) return;
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/jira/fetch-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials, issue_id: issueId })
      });
      if (!res.ok) throw new Error('Failed to fetch issue');
      const data = await res.json();
      setIssueData(data);
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const handleGenerate = async () => {
    if (!issueData) return;
    setIsGenerating(true);
    setErrorMsg('');
    setTestCases([]);
    try {
      const res = await fetch('http://localhost:8000/api/testcases/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_data: issueData,
          template,
          llm_api_key: llmKey
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Generation failed');
      }
      const data = await res.json();
      setTestCases(data.test_cases);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTSV = () => {
    if (testCases.length === 0) return;
    const tsv = Papa.unparse(testCases, { delimiter: '\t' });
    navigator.clipboard.writeText(tsv);
    alert('Copied to clipboard!');
  };

  const handleExportCSV = () => {
    if (testCases.length === 0) return;
    const csv = Papa.unparse(testCases);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `test_cases_${issueId}.csv`;
    link.click();
  };

  const handleExportMD = () => {
    if (testCases.length === 0) return;
    let md = `# Test Cases for ${issueId}\n\n`;
    testCases.forEach(tc => {
      md += `## ${tc.id}: ${tc.title}\n`;
      md += `- **Type:** ${tc.type}\n`;
      md += `- **Priority:** ${tc.priority}\n`;
      md += `- **Preconditions:** ${tc.preconditions}\n`;
      md += `- **Steps:**\n`;
      tc.steps.forEach((step, i) => md += `  ${i + 1}. ${step}\n`);
      md += `- **Test Data:** ${tc.test_data}\n`;
      md += `- **Expected Result:** ${tc.expected_result}\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `test_cases_${issueId}.md`;
    link.click();
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Jira AI Test Case Generator</h1>
          <p className="text-slate-500 mt-2 text-lg">Auto-generate structural test cases from Jira user stories using AI.</p>
        </header>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center border border-red-200">
            <AlertCircle className="w-5 h-5 mr-3" />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Connection Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2 text-blue-500" />
              <h2 className="text-xl font-bold">Jira Connection</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
                <input 
                  type="text" 
                  placeholder="https://your-domain.atlassian.net"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={credentials.base_url}
                  onChange={e => setCredentials({...credentials, base_url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={credentials.email}
                  onChange={e => setCredentials({...credentials, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Token</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={credentials.api_token}
                  onChange={e => setCredentials({...credentials, api_token: e.target.value})}
                />
              </div>
              <button 
                onClick={handleTestConnection}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 px-4 rounded-md transition-colors flex justify-center items-center"
              >
                {connectionStatus === 'testing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {connectionStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
                Test Connection
              </button>
            </div>
            
            <div className="mt-6 border-t border-slate-100 pt-6">
               <label className="block text-sm font-medium text-slate-700 mb-1">Groq API Key (Optional if backend set)</label>
               <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={llmKey}
                  onChange={e => setLlmKey(e.target.value)}
                />
            </div>
          </div>

          {/* Input Panel & Context Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4">Input Setup</h2>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jira Issue ID</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="e.g., PROJ-123"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={issueId}
                      onChange={e => setIssueId(e.target.value)}
                    />
                    <button 
                      onClick={handleFetchIssue}
                      className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Fetch
                    </button>
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={template}
                    onChange={e => setTemplate(e.target.value)}
                  >
                    <option>Functional</option>
                    <option>Regression</option>
                    <option>Smoke</option>
                    <option>Edge</option>
                    <option>Security</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>

            {issueData && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Context Card</h2>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                    {issueData.type} • {issueData.priority}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm h-48 overflow-y-auto mb-4">
                  <h3 className="font-bold text-slate-800 mb-1">{issueData.summary}</h3>
                  <div className="text-slate-600 whitespace-pre-wrap">
                    {typeof issueData.description === 'string' ? issueData.description : JSON.stringify(issueData.description, null, 2)}
                  </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center shadow-sm"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
                  {isGenerating ? 'Generating Test Cases...' : 'Generate Test Cases'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Output Panel */}
        {testCases.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Generated Test Cases <span className="text-slate-400 text-lg">({testCases.length})</span></h2>
              <div className="flex space-x-3">
                <button onClick={handleCopyTSV} className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-sm transition-colors">
                  <Copy className="w-4 h-4 mr-2" /> Copy TSV
                </button>
                <button onClick={handleExportMD} className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-sm transition-colors">
                  <Download className="w-4 h-4 mr-2" /> Markdown
                </button>
                <button onClick={handleExportCSV} className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-sm transition-colors">
                  <Download className="w-4 h-4 mr-2" /> CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Preconditions</th>
                    <th className="px-4 py-3 font-medium">Expected Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {testCases.map((tc, index) => (
                    <tr key={tc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{tc.id}</td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={tc.title} 
                          onChange={(e) => handleTestCaseChange(index, 'title', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">{tc.type}</td>
                      <td className="px-4 py-3">{tc.priority}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={tc.preconditions}>{tc.preconditions}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={tc.expected_result}>{tc.expected_result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
