import { useState, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import AnalysisPanel from './components/AnalysisPanel';
import { analyzeCode } from './services/api';
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
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeCode(code, language);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [code, language]);

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
        <p>Powered by Claude AI - Detect vulnerabilities, optimize performance, and improve code quality</p>
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
