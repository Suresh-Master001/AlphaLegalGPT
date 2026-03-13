import { io } from 'socket.io-client';

const API_BASE_URL = '/api';
const SOCKET_URL = window.location.origin;

const getStoredToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

/**
 * Get auth headers
 */
const getAuthHeaders = () => {
  const token = getStoredToken();
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  return {
    'Content-Type': 'application/json'
  };
};

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
      headers: getAuthHeaders(),
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
    const handleStreaming = (data) => {
      if (onMessage) onMessage(data);
    };

    const handleComplete = (data) => {
      cleanup();
      if (onComplete) onComplete(data);
      resolve(data);
    };

    const handleError = (data) => {
      cleanup();
      if (onError) onError(data);
      reject(new Error(data.error || 'Unknown error'));
    };

    const handleTyping = (data) => {
      if (onTyping) onTyping(data);
    };

    const cleanup = () => {
      socket.off('chat:streaming', handleStreaming);
      socket.off('chat:complete', handleComplete);
      socket.off('chat:error', handleError);
      socket.off('chat:typing', handleTyping);
    };

    socket.on('chat:streaming', handleStreaming);
    socket.on('chat:complete', handleComplete);
    socket.on('chat:error', handleError);
    socket.on('chat:typing', handleTyping);

    socket.emit('chat:message', { 
      query, 
      sessionId, 
      language: localStorage.getItem('language') || 'en', 
      token: getStoredToken()
    });

    setTimeout(() => {
      cleanup();
      reject(new Error('Request timeout'));
    }, 60000);
  });
};

/**
 * Get chat history for a session
 */
export const getChatHistory = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
      headers: getAuthHeaders()
    });
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
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

/**
 * Auth API methods
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signupUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) throw new Error('Signup failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, otp }),
    });
    if (!response.ok) throw new Error('OTP verification failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    console.error('Resend OTP error:', error);
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

