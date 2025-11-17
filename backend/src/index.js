import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeCode } from './services/aiAnalyzer.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Code Reviewer backend is running' });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      const { type, code, language } = data;

      if (type === 'analyze') {
        // Send acknowledgment
        ws.send(JSON.stringify({
          type: 'status',
          message: 'Analyzing code...'
        }));

        // Perform analysis
        const analysis = await analyzeCode(code, language);

        // Send results
        ws.send(JSON.stringify({
          type: 'analysis',
          data: analysis
        }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message || 'An error occurred during analysis'
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// REST API endpoint (alternative to WebSocket)
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const analysis = await analyzeCode(code, language || 'javascript');
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 REST API: http://localhost:${PORT}/api/analyze`);
});
