import { useState, useCallback, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import AnalysisPanel from './components/AnalysisPanel';
import { analyzeCode, getProviders } from './services/api';
import './App.css';

function App() {
  const [code, setCode] = useState(`// Paste your code here for AI-powered analysis
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.execute(query);
}

const password = "admin123";
const apiKey = "sk-1234567890abcdef";
`);
  const [language, setLanguage] = useState('javascript');
  const [provider, setProvider] = useState('');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available providers on mount
  useEffect(() => {
    async function loadProviders() {
      try {
        const data = await getProviders();
        setAvailableProviders(data.providers || []);
        setProvider(data.default || 'claude');
      } catch (err) {
        console.error('Failed to load providers:', err);
        setProvider('claude');
      }
    }
    loadProviders();
  }, []);

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeCode(code, language, provider);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [code, language, provider]);

  const handleApplyRefactoring = useCallback(() => {
    if (analysis?.refactoring?.improvedCode) {
      setCode(analysis.refactoring.improvedCode);
      setAnalysis(null);
    }
  }, [analysis]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI Code Reviewer & Refactorer</h1>
        <p>AI-powered code analysis - Detect vulnerabilities, optimize performance, and improve code quality</p>
      </header>

      <div className="app-container">
        <div className="editor-section">
          <div className="editor-controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
            </select>

            {availableProviders.length > 0 && (
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="provider-select"
                title="Select AI Provider"
              >
                {availableProviders.map((p) => (
                  <option key={p} value={p}>
                    {p === 'claude' && '🧠 Claude'}
                    {p === 'openai' && '🤖 GPT'}
                    {p === 'gemini' && '✨ Gemini'}
                    {p === 'deepseek' && '🔍 Deepseek'}
                    {p === 'kimi' && '🌙 Kimi'}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              className="analyze-btn"
            >
              {loading ? '🔄 Analyzing...' : '🔍 Analyze Code'}
            </button>
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
          />
        </div>

        <div className="analysis-section">
          <AnalysisPanel
            analysis={analysis}
            loading={loading}
            error={error}
            onApplyRefactoring={handleApplyRefactoring}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
