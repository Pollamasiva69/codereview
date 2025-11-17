import './AnalysisPanel.css';

function AnalysisPanel({ analysis, loading, error, onApplyRefactoring }) {
  if (loading) {
    return (
      <div className="analysis-panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing your code with AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-panel">
        <div className="error-state">
          <h3>❌ Analysis Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analysis-panel">
        <div className="empty-state">
          <h3>👨‍💻 Ready to Review</h3>
          <p>Click "Analyze Code" to get AI-powered insights about your code.</p>
          <ul className="features-list">
            <li>🔒 Security vulnerability detection</li>
            <li>⚡ Performance optimization suggestions</li>
            <li>🎯 Code quality improvements</li>
            <li>♻️ Automated refactoring</li>
          </ul>
        </div>
      </div>
    );
  }

  const severityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#ff5722',
    critical: '#f44336'
  };

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h2>Analysis Results</h2>
        <span
          className="severity-badge"
          style={{ background: severityColors[analysis.severity] }}
        >
          {analysis.severity?.toUpperCase()}
        </span>
      </div>

      <div className="analysis-content">
        {/* Summary */}
        <section className="analysis-section">
          <h3>📊 Summary</h3>
          <p className="summary-text">{analysis.summary}</p>
        </section>

        {/* Vulnerabilities */}
        {analysis.vulnerabilities && analysis.vulnerabilities.length > 0 && (
          <section className="analysis-section">
            <h3>🔒 Security Vulnerabilities ({analysis.vulnerabilities.length})</h3>
            <div className="items-list">
              {analysis.vulnerabilities.map((vuln, index) => (
                <div key={index} className="item vulnerability-item">
                  <div className="item-header">
                    <span className="item-type">{vuln.type}</span>
                    <span
                      className="severity-tag"
                      style={{ background: severityColors[vuln.severity] }}
                    >
                      {vuln.severity}
                    </span>
                  </div>
                  {vuln.line && <div className="item-line">Line {vuln.line}</div>}
                  <p className="item-description">{vuln.description}</p>
                  <div className="item-recommendation">
                    <strong>Fix:</strong> {vuln.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Optimizations */}
        {analysis.optimizations && analysis.optimizations.length > 0 && (
          <section className="analysis-section">
            <h3>⚡ Optimization Suggestions ({analysis.optimizations.length})</h3>
            <div className="items-list">
              {analysis.optimizations.map((opt, index) => (
                <div key={index} className="item optimization-item">
                  <div className="item-header">
                    <span className="item-type">{opt.type}</span>
                  </div>
                  {opt.line && <div className="item-line">Line {opt.line}</div>}
                  <p className="item-description"><strong>Issue:</strong> {opt.issue}</p>
                  <p className="item-suggestion"><strong>Suggestion:</strong> {opt.suggestion}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Refactoring */}
        {analysis.refactoring && analysis.refactoring.shouldRefactor && (
          <section className="analysis-section">
            <h3>♻️ Refactoring Recommendations</h3>
            <ul className="refactoring-list">
              {analysis.refactoring.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
            {analysis.refactoring.improvedCode && (
              <div className="refactoring-actions">
                <button
                  className="apply-refactoring-btn"
                  onClick={onApplyRefactoring}
                >
                  ✨ Apply Refactored Code
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default AnalysisPanel;
