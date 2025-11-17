const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

// WebSocket connection for real-time analysis
let ws = null;
let messageHandlers = [];

export function connectWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messageHandlers.forEach(handler => handler(data));
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };

  return ws;
}

export function onWebSocketMessage(handler) {
  messageHandlers.push(handler);
  return () => {
    messageHandlers = messageHandlers.filter(h => h !== handler);
  };
}

// Get available AI providers
export async function getProviders() {
  try {
    const response = await fetch(`${API_URL}/api/providers`);

    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API error:', error);
    return { providers: ['claude'], default: 'claude' };
  }
}

// REST API for code analysis
export async function analyzeCode(code, language = 'javascript', provider = null) {
  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language, provider }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

// WebSocket-based analysis (for real-time feedback)
export function analyzeCodeWS(code, language = 'javascript', provider = null) {
  return new Promise((resolve, reject) => {
    const socket = connectWebSocket();

    const cleanup = onWebSocketMessage((data) => {
      if (data.type === 'analysis') {
        cleanup();
        resolve(data.data);
      } else if (data.type === 'error') {
        cleanup();
        reject(new Error(data.message));
      }
    });

    // Wait for connection to open
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'analyze',
        code,
        language,
        provider
      }));
    } else {
      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({
          type: 'analyze',
          code,
          language,
          provider
        }));
      });
    }

    // Timeout after 60 seconds
    setTimeout(() => {
      cleanup();
      reject(new Error('Analysis timeout'));
    }, 60000);
  });
}
