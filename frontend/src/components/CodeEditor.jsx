import { Editor } from '@monaco-editor/react';

function CodeEditor({ value, onChange, language }) {
  const handleEditorChange = (newValue) => {
    onChange(newValue || '');
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={handleEditorChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 16 }
      }}
    />
  );
}

export default CodeEditor;
