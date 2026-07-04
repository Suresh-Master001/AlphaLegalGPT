import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { initializeSocket, getSocket, getChatHistory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from './useGeolocation';

const getStorageKey = (userId) => `attorneygpt_chats_${userId || 'guest'}`;
const getCurrentChatKey = (userId) => `attorneygpt_current_chat_${userId || 'guest'}`;

/**
 * Generate unique ID
 */
const generateId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Custom hook for chat functionality
 */
export const useChat = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { location, isEnabled, loading, toggleLocation } = useGeolocation();
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [error, setError] = useState(null);
  const [hasGeneratedResponse, setHasGeneratedResponse] = useState(false);
  
  const lastQueryRef = useRef('');
  const currentChatIdRef = useRef(null);

  // Keep ref in sync
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // Memoize storage keys based on userId
  const STORAGE_KEY = useMemo(() => getStorageKey(user?.id), [user?.id]);
  const CURRENT_CHAT_KEY = useMemo(() => getCurrentChatKey(user?.id), [user?.id]);

  /**
   * Save chats to localStorage
   */
  const saveChats = useCallback((updatedChats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }, [STORAGE_KEY]);

  /**
   * Load chats from localStorage
   */
  const loadChats = useCallback(() => {
    try {
      const savedChats = localStorage.getItem(STORAGE_KEY);
      const savedCurrentChat = localStorage.getItem(CURRENT_CHAT_KEY);
      
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);
        
        const currentChat = savedCurrentChat 
          ? parsedChats.find(c => c.id === savedCurrentChat)
          : parsedChats[0];

        if (currentChat) {
          setCurrentChatId(currentChat.id);
          setMessages(currentChat.messages || []);
        }
      } else {
        setChats([]);
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [STORAGE_KEY, CURRENT_CHAT_KEY]);

  /**
   * Create new chat
   */
  const createNewChat = useCallback(() => {
    const newId = generateId();
    const newChat = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    };
    
    setChats(prev => {
      const updated = [newChat, ...prev];
      saveChats(updated);
      return updated;
    });
    
    setCurrentChatId(newId);
    currentChatIdRef.current = newId;
    setMessages([]);
    setHasGeneratedResponse(false);
    localStorage.setItem(CURRENT_CHAT_KEY, newId);
    return newId;
  }, [CURRENT_CHAT_KEY, saveChats]);

  /**
   * Switch between chats
   */
  const switchChat = useCallback((chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      currentChatIdRef.current = chatId;
      setMessages(chat.messages || []);
      setHasGeneratedResponse(chat.messages?.length > 0);
      localStorage.setItem(CURRENT_CHAT_KEY, chatId);
    }
  }, [chats, CURRENT_CHAT_KEY]);

  /**
   * Sync chats with backend
   */
  const syncWithBackend = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          setChats(data.history);
          saveChats(data.history);
          
          const currentInHistory = data.history.find(c => c.id === currentChatIdRef.current);
          if (!currentChatIdRef.current || !currentInHistory) {
            const mostRecent = data.history[0];
            setCurrentChatId(mostRecent.id);
            setMessages(mostRecent.messages || []);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing with backend:', err);
    }
  }, [user, saveChats]);

  /**
   * Delete a chat session
   */
  const deleteChat = useCallback(async (sessionId) => {
    try {
      await fetch(`/api/chat/history/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      setChats(prev => {
        const updated = prev.filter(c => c.id !== sessionId);
        saveChats(updated);
        
        if (currentChatIdRef.current === sessionId) {
          if (updated.length > 0) {
            setCurrentChatId(updated[0].id);
            setMessages(updated[0].messages || []);
          } else {
            setCurrentChatId(null);
            setMessages([]);
          }
        }
        return updated;
      });
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  }, [saveChats]);

  /**
   * Clear current chat local history
   */
  const clearChat = useCallback(() => {
    if (!currentChatIdRef.current) return;
    
    setMessages([]);
    setHasGeneratedResponse(false);
    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === currentChatIdRef.current) {
          return {
            ...chat,
            title: 'New Chat',
            messages: [],
            updatedAt: getTimestamp(),
          };
        }
        return chat;
      });
      saveChats(updated);
      return updated;
    });
  }, [saveChats]);

  /**
   * Clear all history from backend and local
   */
  const clearAllHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/clear-all', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        setChats([]);
        setMessages([]);
        setCurrentChatId(null);
        currentChatIdRef.current = null;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CURRENT_CHAT_KEY);
        createNewChat();
      }
    } catch (err) {
      console.error('Error clearing all history:', err);
    }
  }, [STORAGE_KEY, CURRENT_CHAT_KEY, createNewChat]);

  /**
   * Send message
   */
  const sendMessage = useCallback(async (query) => {
    if (!query.trim()) return;
    
    const socket = getSocket();
    if (!socket) {
      setError('Connection not established');
      return;
    }

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: getTimestamp(),
    };

    setMessages(prev => [...prev, userMessage]);
    setHasGeneratedResponse(false);
    setIsLoading(true);
    setStreamingText('');
    lastQueryRef.current = query;

    let sessionId = currentChatIdRef.current;
    if (!sessionId) {
      sessionId = createNewChat();
    }

    // ── Get fresh location right before sending ──────────────────────────────
    // location state may be null if geolocation hasn't resolved yet
    const getFreshLocation = () =>
      new Promise((resolve) => {
        // If we already have a location from state, use it
        if (location && location.lat && location.lng) {
          resolve(location);
          return;
        }
        // Otherwise try to get it fresh from browser
        if (isEnabled && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 3000, maximumAge: 60000 }
          );
        } else {
          resolve(null);
        }
      });

    const currentLocation = await getFreshLocation();
    console.log('[sendMessage] location being sent:', currentLocation);

    const isRealtime = localStorage.getItem('realtime') !== 'off';

    socket.emit('chat:message', {
      query,
      language: localStorage.getItem('language') || 'en',
      sessionId: sessionId,
      token: sessionStorage.getItem('authToken'),
      location: currentLocation,
      realtime: isRealtime
    });
  }, [createNewChat, location, isEnabled]);

  // Handle socket response events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTyping = (data) => {
       setIsTyping(data.isTyping);
    };

    const handleStream = (data) => {
      setStreamingText(prev => prev + data.text);
      setIsLoading(false); // Once streaming starts, we are no longer "loading" in the blocking sense
      setIsTyping(true);
    };

    const handleComplete = (data) => {
       const aiMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: getTimestamp(),
        citations: data.citations || [],
        confidence: data.confidence || 1.0,
      };

      const targetSessionId = data.sessionId || currentChatIdRef.current;

      setMessages(prev => [...prev, aiMessage]);
      setHasGeneratedResponse(true);
      setStreamingText(''); // Clear streaming text
      setIsLoading(false);
      setIsTyping(false);
      
      // Update local chats list with messages
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.id === targetSessionId) {
            return {
              ...chat,
              messages: [...chat.messages, { role: 'user', content: lastQueryRef.current }, aiMessage],
              updatedAt: getTimestamp(),
            };
          }
          return chat;
        });
        saveChats(updated);
        return updated;
      });

      if (user) syncWithBackend();
    };

    const handleError = (data) => {
      setError(data.error || 'Failed to process request');
      setIsLoading(false);
      setIsTyping(false);
    };

    socket.on('chat:typing', handleTyping);
    socket.on('chat:stream', handleStream);
    socket.on('chat:complete', handleComplete);
    socket.on('chat:error', handleError);

    return () => {
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stream', handleStream);
      socket.off('chat:complete', handleComplete);
      socket.off('chat:error', handleError);
    };
  }, [user, saveChats, syncWithBackend]); // Removed currentChatId dependency to use ref

  // Initialize and Sync on mount
  useEffect(() => {
    const socket = initializeSocket();
    socket.on('connect', () => console.log('Socket connected'));
    
    loadChats();
    if (user) syncWithBackend();

    return () => {};
  }, [user?.id, isAuthenticated, loadChats, syncWithBackend]);

  return {
    messages,
    isLoading,
    isTyping,
    streamingText,
    chats,
    currentChatId,
    error,
    createNewChat,
    switchChat,
    deleteChat,
    sendMessage,
    clearChat,
    clearAllHistory,
    location,
    isLocationEnabled: isEnabled,
    isLocationLoading: loading,
    toggleLocation,
    hasGeneratedResponse,
  };
};

export default useChat;
