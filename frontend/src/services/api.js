import { io } from 'socket.io-client';

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  const trimmed = raw.replace(/\/$/, '');
  if (!trimmed) return '/api';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
})();
const SOCKET_URL = (() => {
  const configured = import.meta.env.VITE_SOCKET_URL;
  if (configured) return configured;

  // If the frontend is deployed separately from the backend, default socket host to the same host
  // that serves the REST API (VITE_API_URL). This avoids hardcoding an incorrect production domain.
  const apiRaw = import.meta.env.VITE_API_URL;
  if (apiRaw) {
    const apiNoSlash = apiRaw.replace(/\/$/, '');
    const apiHost = apiNoSlash.replace(/\/api$/, '');
    return apiHost;
  }

  // Dev fallback: current origin
  return window.location.origin;
})();


const getStoredToken = () => {
  return localStorage.getItem('authToken') || 
         localStorage.getItem('token') || 
         sessionStorage.getItem('authToken') || 
         sessionStorage.getItem('token');
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
 * Connection status callback
 */
let connectionStatusCallback = null;

/**
 * Initialize socket connection with proper error handling
 */
export const initializeSocket = (onStatusChange = null) => {
  connectionStatusCallback = onStatusChange;
  
  if (!socket) {
    socket = io(SOCKET_URL, {
      // Be resilient on platforms where websocket upgrade is flaky.
      // Start with polling, then allow websocket fallback.
      transports: ['polling', 'websocket'],

      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,

      // Increase timeout a bit to avoid early failures while the server boots.
      timeout: 20000,

      // Ensure cookies are sent when using auth behind same-site setups.
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
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
      if (connectionStatusCallback) {
        connectionStatusCallback(false);
      }
    });
    
    socket.on('reconnect_attempt', (attempt) => {
      console.log('Socket reconnect attempt:', attempt);
    });
    
    socket.on('reconnect', () => {
      console.log('Socket reconnected successfully');
      if (connectionStatusCallback) {
        connectionStatusCallback(true);
      }
    });
  }
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};

/**
 * Get socket connection state
 */
export const getSocketState = () => {
  if (!socket) return 'disconnected';
  return socket.connected ? 'connected' : 'connecting';
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
      socket.off('chat:stream', handleStreaming);
      socket.off('chat:complete', handleComplete);
      socket.off('chat:error', handleError);
      socket.off('chat:typing', handleTyping);
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
/**
 * Handle API response with standard format
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed response data
 * @throws {Error} Throws error with message and optional type
 */
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

/**
 * Login user
 * @route POST /api/auth/login
 */
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password }),
    // Add timeout for better UX
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
};

/**
 * Signup new user
 * @route POST /api/auth/signup
 */
export const signupUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, email, password }),
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
};


/**
 * Verify OTP
 * @route POST /api/auth/verify-otp
 */
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


/**
 * Resend OTP
 * @route POST /api/auth/resend-otp
 */
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


/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email }),
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
};

/**
 * Reset password with OTP
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, otp, newPassword }),
    signal: AbortSignal.timeout(15000)
  });
  
  return handleApiResponse(response);
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

/**
 * Upload Document
 */
/**
 * Upload document for parsing
 * @route POST /api/upload
 * @param {File} file - File object to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Upload result with extracted text
 */
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
      signal: AbortSignal.timeout(30000) // 30 second timeout for large files
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

