import { useState, useCallback, useRef, useEffect } from 'react';
import { initializeSocket, getSocket } from '../services/api';

const STORAGE_KEY = 'attorneygpt_chats';
const CURRENT_CHAT_KEY = 'attorneygpt_current_chat';

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
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [error, setError] = useState(null);
  
  const streamingTextRef = useRef('');
  
  // Initialize socket on mount
  useEffect(() => {
    const socket = initializeSocket();
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    // Load saved chats from localStorage
    loadChats();
    
    return () => {
      // Cleanup handled by socket manager
    };
  }, []);
  
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
        
        if (savedCurrentChat && parsedChats.find(c => c.id === savedCurrentChat)) {
          setCurrentChatId(savedCurrentChat);
          const currentChat = parsedChats.find(c => c.id === savedCurrentChat);
          if (currentChat && currentChat.messages) {
            setMessages(currentChat.messages);
          }
        } else if (parsedChats.length > 0) {
          setCurrentChatId(parsedChats[0].id);
          setMessages(parsedChats[0].messages || []);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, []);
  
  /**
   * Save chats to localStorage
   */
  const saveChats = useCallback((updatedChats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }, []);
  
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
    setMessages([]);
    setError(null);
    
    return newId;
  }, [saveChats]);
  
  /**
   * Switch to different chat
   */
  const switchChat = useCallback((chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages || []);
      localStorage.setItem(CURRENT_CHAT_KEY, chatId);
    }
  }, [chats]);
  
  /**
   * Delete chat
   */
  const deleteChat = useCallback((chatId) => {
    setChats(prev => {
      const updated = prev.filter(c => c.id !== chatId);
      saveChats(updated);
      return updated;
    });
    
    if (currentChatId === chatId) {
      const remaining = chats.filter(c => c.id !== chatId);
      if (remaining.length > 0) {
        switchChat(remaining[0].id);
      } else {
        createNewChat();
      }
    }
  }, [chats, currentChatId, switchChat, createNewChat, saveChats]);
  
  /**
   * Send message
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;
    
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: getTimestamp(),
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setStreamingText('');
    streamingTextRef.current = '';
    
    try {
      // Initialize socket if needed
      let socket = getSocket();
      if (!socket) {
        socket = initializeSocket();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Set up listeners
      const handleStreaming = (data) => {
        if (data.text) {
          streamingTextRef.current += data.text;
          setStreamingText(streamingTextRef.current);
        }
      };
      
      const handleComplete = (data) => {
        cleanup();
        
        const aiMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.answer || streamingTextRef.current,
          citations: data.citations || [],
          confidence: data.confidence || 0,
          timestamp: getTimestamp(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setStreamingText('');
        streamingTextRef.current = '';
        
        // Update chat in list
        updateChatWithMessages([userMessage, aiMessage]);
      };
      
      const handleError = (data) => {
        cleanup();
        throw new Error(data.error || 'Failed to get response');
      };
      
      const handleTyping = (data) => {
        setIsTyping(data.isTyping);
      };
      
      const cleanup = () => {
        const s = getSocket();
        if (s) {
          s.off('chat:streaming', handleStreaming);
          s.off('chat:complete', handleComplete);
          s.off('chat:error', handleError);
          s.off('chat:typing', handleTyping);
        }
      };
      
      socket.on('chat:streaming', handleStreaming);
      socket.on('chat:complete', handleComplete);
      socket.on('chat:error', handleError);
      socket.on('chat:typing', handleTyping);
      
      // Send message
      socket.emit('chat:message', {
        query: content,
        sessionId: currentChatId || 'default',
      });
      
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      
      const errorMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'I encountered an error: ' + (err.message || 'Unknown error') + '. Please try again.',
        isError: true,
        timestamp: getTimestamp(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [isLoading, currentChatId]);
  
  /**
   * Update chat with new messages
   */
  const updateChatWithMessages = useCallback((newMessages) => {
    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === currentChatId) {
          // Update title if first message
          let title = chat.title;
          if (title === 'New Chat' && newMessages.length > 0) {
            const userMsg = newMessages.find(m => m.role === 'user');
            if (userMsg) {
              title = userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? '...' : '');
            }
          }
          
          return {
            ...chat,
            title,
            messages: [...(chat.messages || []), ...newMessages],
            updatedAt: getTimestamp(),
          };
        }
        return chat;
      });
      
      saveChats(updated);
      return updated;
    });
  }, [currentChatId, saveChats]);
  
  /**
   * Clear current chat
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    
    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === currentChatId) {
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
  }, [currentChatId, saveChats]);
  
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
  };
};

export default useChat;

