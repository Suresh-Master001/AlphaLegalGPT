import { io } from 'socket.io-client';

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  const trimmed = raw?.replace(/\/$/, '');
  if (!trimmed) return '/api';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
})();

const SOCKET_URL = (() => {
  // First, check if VITE_SOCKET_URL is explicitly configured
  const configured = import.meta.env.VITE_SOCKET_URL;
  if (configured) return configured;
  
  // For Vercel proxy setups, use current origin which will route through vercel.json rewrites
  // This ensures socket.io connects through the proxy which forwards to the backend
  return window.location.origin;
})();

const getStoredToken = () => {
  return localStorage.getItem('authToken') || 
         localStorage.getItem('token') || 
         sessionStorage.getItem('authToken') || 
         sessionStorage.getItem('token');
};

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

// Socket.io client instance
let socket = null;
let connectionStatusCallback = null;

// Connection state tracking
let connectionAttempted = false;
let connectionFailed = false;

export const initializeSocket = (onStatusChange = null) => {
  connectionStatusCallback = onStatusChange;
  
  // Return existing socket if already initialized
  if (socket) {
    if (socket.connected) {
      connectionStatusCallback?.(true);
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['polling'], // Use polling only for better proxy compatibility
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    timeout: 20000,
    path: '/socket.io',
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    connectionFailed = false;
    connectionAttempted = true;
    if (connectionStatusCallback) {
      connectionStatusCallback(true);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (connectionStatusCallback) {
      connectionStatusCallback(false);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 Socket connection error:', error.message);
    console.error('🔴 Socket connection error details:', {
      message: error.message,
      type: error.type,
      description: error.description,
      context: SOCKET_URL
    });
    connectionFailed = true;
    connectionAttempted = true;
    if (connectionStatusCallback) {
      connectionStatusCallback(false);
    }
  });

  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
    if (connectionStatusCallback) {
      connectionStatusCallback(false);
    }
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log('Socket reconnect attempt:', attempt);
  });

  socket.on('reconnect', () => {
    console.log('Socket reconnected successfully');
    connectionFailed = false;
    if (connectionStatusCallback) {
      connectionStatusCallback(true);
    }
  });
  
  return socket;
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};

export const getSocketState = () => {
  if (!socket) return 'disconnected';
  return socket.connected ? 'connected' : 'connecting';
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectionAttempted = false;
    connectionFailed = false;
  }
};

export const sendChatMessage = async (query, sessionId = 'default', location = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, sessionId, location }),
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

// Fallback to REST API when socket fails
export const sendMessageWithFallback = async (query, sessionId = 'default', location = null, language = 'en') => {
  // Try socket first if available
  if (socket && socket.connected) {
    return new Promise((resolve, reject) => {
      const handleComplete = (data) => {
        cleanup();
        resolve(data);
      };

      const handleError = (data) => {
        cleanup();
        reject(new Error(data.error || 'Unknown error'));
      };

      const cleanup = () => {
        socket?.off('chat:complete', handleComplete);
        socket?.off('chat:error', handleError);
      };

      socket.on('chat:complete', handleComplete);
      socket.on('chat:error', handleError);

      socket.emit('chat:message', {
        query,
        sessionId,
        language: localStorage.getItem('language') || 'en',
        token: getStoredToken(),
        location,
        realtime: localStorage.getItem('realtime') !== 'off'
      });

      setTimeout(() => {
        cleanup();
        reject(new Error('Socket request timeout'));
      }, 60000);
    });
  }
  
  // Fallback to REST API
  console.log('Socket unavailable, falling back to REST API');
  return await sendChatMessage(query, sessionId, location);
};

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
      socket?.off('chat:stream', handleStreaming);
      socket?.off('chat:complete', handleComplete);
      socket?.off('chat:error', handleError);
      socket?.off('chat:typing', handleTyping);
    };

    socket.on('chat:stream', handleStreaming);
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

const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const errorMessage = data.error || 'An error occurred';
    const error = new Error(errorMessage);
    error.type = data.type || 'unknown_error';
    error.statusCode = response.status;
    error.response = data;
    throw error;
  }
  
  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
};

export const signupUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, email, password }),
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, otp }),
      signal: AbortSignal.timeout(15000)
    });
    
    return handleApiResponse(response);
  } catch (error) {
    if (error?.name === 'AbortError') {
      const err = new Error('OTP verification timed out. Please wait a moment and try again.');
      err.type = 'otp_timeout';
      throw err;
    }
    throw error;
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(15000)
    });
    
    return handleApiResponse(response);
  } catch (error) {
    if (error?.name === 'AbortError') {
      const err = new Error('Resend OTP request timed out (email delivery may be delayed). Try again.');
      err.type = 'otp_timeout';
      throw err;
    }
    throw error;
  }
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email }),
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, otp, newPassword }),
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};

export const uploadDocument = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    
    const headers = {};
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(30000)
    });
    
    return handleApiResponse(response);
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('Upload timed out. Please try again with a smaller file.');
    }
    console.error('Upload document error:', error);
    throw error;
  }
};