# AI Code Reviewer & Refactorer

An intelligent code review tool powered by multiple AI providers (Claude, GPT, Gemini, Deepseek, Kimi) that analyzes your code for security vulnerabilities, performance issues, and provides automated refactoring suggestions.

## Features

- **Multiple AI Providers**: Choose between Claude, GPT-4, Gemini, Deepseek, and Kimi
- **Claude Extended Thinking**: Advanced reasoning with Claude's thinking mode enabled
- **Real-time Code Analysis**: Get instant feedback on your code quality
- **Security Vulnerability Detection**: Identify SQL injection, XSS, authentication flaws, and more
- **Performance Optimization**: Detect inefficient code patterns and get optimization suggestions
- **Automated Refactoring**: Receive refactored code with best practices applied
- **Multi-language Support**: JavaScript, TypeScript, Python, Java, C#, Go, Rust, PHP, Ruby
- **Monaco Editor**: Professional code editor with syntax highlighting
- **WebSocket Support**: Real-time bidirectional communication for instant feedback
- **Provider Agnostic**: AI responses don't reveal which provider is being used

## Tech Stack

### Frontend
- **React 18**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Monaco Editor**: VS Code's editor component
- **WebSocket**: Real-time communication

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **WebSocket (ws)**: Real-time communication
- **Multi-AI Support**:
  - Anthropic Claude (with extended thinking)
  - OpenAI GPT-4
  - Google Gemini
  - Deepseek
  - Kimi (Moonshot AI)

## Architecture

```
┌─────────────────┐         WebSocket/REST         ┌─────────────────┐
│                 │◄──────────────────────────────►│                 │
│   React App     │                                │  Express Server │
│  Monaco Editor  │         Code Analysis          │   WebSocket     │
│  AI Selector    │                                │  Multi-Provider │
│                 │                                │                 │
└─────────────────┘                                └────────┬────────┘
                                                            │
                                      ┌─────────────────────┼─────────────────────┐
                                      │                     │                     │
                                      ▼                     ▼                     ▼
                              ┌──────────────┐    ┌──────────────┐      ┌──────────────┐
                              │   Claude AI  │    │  OpenAI GPT  │ ...  │ Gemini/Other │
                              │  (Thinking)  │    │              │      │              │
                              └──────────────┘    └──────────────┘      └──────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- At least one AI provider API key:
  - **Claude**: https://console.anthropic.com/ (recommended, has thinking mode)
  - **OpenAI**: https://platform.openai.com/api-keys
  - **Gemini**: https://makersuite.google.com/app/apikey
  - **Deepseek**: https://platform.deepseek.com/
  - **Kimi**: https://platform.moonshot.cn/

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codereview
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   ```

   Edit `.env` and add your AI provider API keys (at least one is required):
   ```
   # Choose default provider
   DEFAULT_AI_PROVIDER=claude

   # Add API keys for providers you want to use
   ANTHROPIC_API_KEY=your_anthropic_key_here
   OPENAI_API_KEY=your_openai_key_here
   GOOGLE_API_KEY=your_google_key_here
   DEEPSEEK_API_KEY=your_deepseek_key_here
   KIMI_API_KEY=your_kimi_key_here

   # Enable Claude thinking mode (recommended)
   ENABLE_CLAUDE_THINKING=true

   PORT=3001
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

   The backend will start on `http://localhost:3001`

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Select a programming language** from the dropdown menu
2. **Paste or write your code** in the Monaco editor
3. **Click "Analyze Code"** to start the AI analysis
4. **Review the results** in the analysis panel:
   - Security vulnerabilities with severity levels
   - Performance optimization suggestions
   - Code quality improvements
   - Refactoring recommendations
5. **Apply refactoring** by clicking the "Apply Refactored Code" button

## API Endpoints

### REST API

#### POST `/api/analyze`
Analyze code and get security, performance, and quality insights.

**Request Body:**
```json
{
  "code": "your code here",
  "language": "javascript"
}
```

**Response:**
```json
{
  "summary": "Brief overview of code quality",
  "severity": "low|medium|high|critical",
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "critical",
      "line": 5,
      "description": "User input concatenated directly into SQL query",
      "recommendation": "Use parameterized queries"
    }
  ],
  "optimizations": [
    {
      "type": "performance",
      "line": 10,
      "issue": "Inefficient loop",
      "suggestion": "Use Array.map() instead"
    }
  ],
  "refactoring": {
    "shouldRefactor": true,
    "suggestions": ["Extract function", "Use const instead of var"],
    "improvedCode": "refactored code here"
  }
}
```

### WebSocket

Connect to `ws://localhost:3001` for real-time analysis.

**Send message:**
```json
{
  "type": "analyze",
  "code": "your code here",
  "language": "javascript"
}
```

**Receive messages:**
```json
{
  "type": "status",
  "message": "Analyzing code..."
}
```

```json
{
  "type": "analysis",
  "data": { /* analysis results */ }
}
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload on changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement
```

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## Security Analysis Features

The AI analyzer checks for:

- **SQL Injection**: Direct string concatenation in queries
- **XSS (Cross-Site Scripting)**: Unsafe HTML rendering
- **Authentication Issues**: Weak password storage, missing validation
- **Sensitive Data Exposure**: Hardcoded credentials, API keys
- **Security Misconfiguration**: Unsafe defaults
- **Insecure Deserialization**: Unsafe data parsing
- **Command Injection**: Unsafe system command execution
- **Path Traversal**: Unsafe file path handling

## Performance Optimization

The tool suggests improvements for:

- Inefficient loops and iterations
- Unnecessary re-renders (React)
- Memory leaks
- Blocking operations
- Inefficient algorithms
- Database query optimization

## Code Quality Checks

- Code smells and anti-patterns
- Best practices violations
- Maintainability issues
- Naming conventions
- Code duplication
- Complexity reduction

## Environment Variables

### Backend
- `ANTHROPIC_API_KEY`: Your Anthropic API key (required)
- `PORT`: Server port (default: 3001)

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)
- `VITE_WS_URL`: WebSocket URL (default: ws://localhost:3001)

## Troubleshooting

### Backend Issues

**Error: Missing API key**
- Make sure you've created a `.env` file in the backend directory
- Add your Anthropic API key: `ANTHROPIC_API_KEY=your_key_here`

**Error: Port already in use**
- Change the port in `.env`: `PORT=3002`
- Update the frontend proxy in `vite.config.js`

### Frontend Issues

**Connection refused**
- Make sure the backend server is running on port 3001
- Check the browser console for CORS errors
- Verify the API URL in the frontend configuration

**Editor not loading**
- Clear browser cache and reload
- Check browser console for Monaco Editor errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Powered by [Anthropic Claude](https://www.anthropic.com/)
- Editor by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)

## Future Enhancements

- [ ] Support for more programming languages
- [ ] Custom rule configuration
- [ ] Integration with GitHub/GitLab
- [ ] Code comparison view
- [ ] Export analysis reports (PDF, JSON)
- [ ] Team collaboration features
- [ ] Historical analysis tracking
- [ ] Custom AI prompts
