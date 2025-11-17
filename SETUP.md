# Quick Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

From the root directory, run:

```bash
npm run install:all
```

Or manually:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure your AI providers (at least one is required):

```env
# Choose your default AI provider
DEFAULT_AI_PROVIDER=claude

# Add API keys for the providers you want to use
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_API_KEY=your-google-api-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here
KIMI_API_KEY=your-kimi-key-here

# Enable Claude thinking mode (highly recommended)
ENABLE_CLAUDE_THINKING=true

PORT=3001
```

**Get your API keys:**

- **Claude (recommended)**: https://console.anthropic.com/
  - Supports extended thinking mode for better analysis
- **OpenAI (GPT-4)**: https://platform.openai.com/api-keys
- **Google Gemini**: https://makersuite.google.com/app/apikey
- **Deepseek**: https://platform.deepseek.com/
- **Kimi (Moonshot)**: https://platform.moonshot.cn/

You only need at least one API key to get started!

### 3. Start the Application

**Option A: Run both servers separately**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option B: Use separate npm scripts**

From the root directory:

Terminal 1:
```bash
npm run dev:backend
```

Terminal 2:
```bash
npm run dev:frontend
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

The backend API will be running on:
```
http://localhost:3001
```

## Verification

To verify everything is working:

1. You should see the AI Code Reviewer interface
2. Try analyzing this sample code:

```javascript
function login(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.execute(query);
}
```

3. Click "Analyze Code" - you should see security vulnerabilities detected

## Common Issues

### Port Already in Use

If port 3001 or 3000 is already in use:

**Backend:** Change port in `backend/.env`
```env
PORT=3002
```

**Frontend:** Change port in `frontend/vite.config.js`
```javascript
server: {
  port: 3005
}
```

### Missing API Key Error

Make sure:
- You created the `.env` file in the `backend` directory (not root)
- The API key is valid and starts with `sk-ant-`
- There are no extra spaces or quotes around the key

### Connection Refused

Make sure:
- Backend server is running (check terminal for "Server running on port 3001")
- No firewall is blocking the connection
- The ports match between frontend and backend configuration

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API endpoints documentation
- Customize the analysis prompts in `backend/src/services/aiAnalyzer.js`
- Modify the UI in `frontend/src/components/`

Happy coding!
