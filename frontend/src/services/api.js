import { io } from 'socket.io-client';

const API_BASE_URL = '/api';
const SOCKET_URL = window.location.origin;

/**
 * Socket.io client instance
 */
let socket = null;

/**
 * Initialize socket connection
 */
export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => socket;

/**
 * Close socket connection
 */
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Send chat message via REST API
 */
export const sendChatMessage = async (query, sessionId = 'default') => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Send chat message via WebSocket with streaming
 */
export const sendChatMessageStream = (query, sessionId = 'default', callbacks = {}) => {
  const { onMessage, onComplete, onError, onTyping } = callbacks;

  if (!socket) {
    initializeSocket();
  }

  return new Promise((resolve, reject) => {
    // Set up event listeners
    const handleStreaming = (data) => {
      if (onMessage) {
        onMessage(data);
      }
    };

    const handleComplete = (data) => {
      cleanup();
      if (onComplete) {
        onComplete(data);
      }
      resolve(data);
    };

    const handleError = (data) => {
      cleanup();
      if (onError) {
        onError(data);
      }
      reject(new Error(data.error || 'Unknown error'));
    };

    const handleTyping = (data) => {
      if (onTyping) {
        onTyping(data);
      }
    };

    const cleanup = () => {
      socket.off('chat:streaming', handleStreaming);
      socket.off('chat:complete', handleComplete);
      socket.off('chat:error', handleError);
      socket.off('chat:typing', handleTyping);
    };

    // Register listeners
    socket.on('chat:streaming', handleStreaming);
    socket.on('chat:complete', handleComplete);
    socket.on('chat:error', handleError);
    socket.on('chat:typing', handleTyping);

    // Send message
    socket.emit('chat:message', { query, sessionId, language: localStorage.getItem('language') || 'en' });

    // Handle timeout
    setTimeout(() => {
      if (!socket.hasListeners('chat:complete')) {
        cleanup();
        reject(new Error('Request timeout'));
      }
    }, 60000);
  });
};

/**
 * Get chat history for a session
 */
export const getChatHistory = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

/**
 * Clear chat history for a session
 */
export const clearChatHistory = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

/**
 * Check API health
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};

