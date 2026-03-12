/**
 * Chat Routes with RAG + Gemini
 * Implements Retrieval Augmented Generation for legal Q&A
 * Uses Gemini to generate user-friendly responses
 * 
 * Supports:
 * - IPC sections (JSON)
 * - BNS 2023 sections (JSON)
 */

import express from 'express';
import { retrieveAndPrepareContext } from '../rag/retriever.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { 
  getSystemPrompt, 
  getGreetingResponse, 
  getErrorResponse, 
  isSupportedLanguage 
} from '../i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const router = express.Router();

const rawApiKey = process.env.GEMINI_API_KEY || "";
const geminiApiKey = rawApiKey.trim();
console.log('GEMINI_API_KEY loaded:', geminiApiKey ? geminiApiKey.substring(0, 15) + '...' : 'EMPTY');
const hasPlaceholderKey = geminiApiKey === process.env.GEMINI_API_KEY;
const geminiModel = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

if (!geminiApiKey || geminiApiKey.startsWith('replace_with') || geminiApiKey === 'YOUR_API_KEY_HERE') {
  console.warn('WARNING: Using placeholder API key - Gemini calls will fail. Please add valid API key to backend/.env');
}

// Simple in-memory chat history
const chatHistory = new Map();

/**
 * POST /api/chat
 * Handle chat requests with RAG + Gemini
 * Supports language parameter: 'en' (English) or 'ta' (Tamil)
 */
router.post('/chat', async (req, res) => {
  try {
    const { query, sessionId, language = 'en' } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Validate and normalize language (fallback to 'en' if unsupported)
    const normalizedLanguage = isSupportedLanguage(language) ? language : 'en';
    
    console.log(`Processing request for: ${query} [lang: ${normalizedLanguage}]`);
    
    // Step 1: Retrieve relevant documents using RAG
    const retrievalResult = await retrieveAndPrepareContext(query);
    
    // Step 2: Generate user-friendly response using Gemini (with language support)
    const response = await generateFriendlyResponse(query, retrievalResult, normalizedLanguage);
    
    // Store in chat history
    if (!chatHistory.has(sessionId)) {
      chatHistory.set(sessionId, []);
    }
    const history = chatHistory.get(sessionId);
    history.push({ role: 'user', content: query });
    history.push({ role: 'assistant', content: response.answer, citations: response.citations });
    
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    // Return structured JSON response
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      answer: "I could not find an exact IPC reference for your question. Please consult a legal professional.",
      citations: [],
      section_title: "",
      confidence: 0
    });
  }
});

router.get('/chat/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = chatHistory.get(sessionId) || [];
  res.json({ history });
});

router.delete('/chat/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  chatHistory.delete(sessionId);
  res.json({ success: true });
});

/**
 * Generate user-friendly response using Gemini
 * Combines RAG context with AI generation
 * @param {string} query - User's query
 * @param {Object} retrievalResult - Retrieved documents from RAG
 * @param {string} language - Language code ('en' or 'ta')
 */
async function generateFriendlyResponse(query, retrievalResult, language = 'en') {
  const { documents, citations, confidence } = retrievalResult;
  
  const relevantDoc = documents[0];
  
  // If no relevant document found
  if (!relevantDoc) {
    return getErrorResponse('noReference', language);
  }
  
  // Check for greetings using i18n
  const greetingResponse = getGreetingResponse(query, language);
  if (greetingResponse) {
    return greetingResponse;
  }
  
  // Build context from retrieved documents
  let context = "";
  let sectionTitle = relevantDoc.title || relevantDoc.section;
  
  documents.forEach((doc, index) => {
    context += `\n\nDocument ${index + 1}:\n`;
    context += `Section: ${doc.section}\n`;
    context += `Title: ${doc.title || 'N/A'}\n`;
    context += `Content: ${doc.content || doc.pageContent || 'N/A'}\n`;
  });
  
  // Get localized system prompt based on language
  const systemPrompt = getSystemPrompt(language);
  
  // Create prompt for Gemini with language instruction
  const languageInstruction = language === 'ta' 
    ? `\n\nIMPORTANT: Respond in Tamil language (தமிழ்).`
    : '';
  
  const prompt = `${systemPrompt}${languageInstruction}

User Question: ${query}

Legal Context: ${context}`;

  try {
    const responseText = await generateWithGemini(prompt);
    
    // Try to extract JSON from response
    try {
      // Find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          answer: parsed.answer || responseText,
          citations: parsed.citations || citations,
          section_title: parsed.section_title || sectionTitle,
          confidence: parsed.confidence || (documents.length > 0 ? 0.85 : 0)
        };
      }
    } catch (parseError) {
      console.log('JSON parse failed, using raw response');
    }
    
    // Return as structured response
    return {
      answer: responseText,
      citations: citations,
      section_title: sectionTitle,
      confidence: documents.length > 0 ? 0.85 : 0
    };
    
  } catch (geminiError) {
    let answer = "";
    if (relevantDoc.isStatute) {
      answer = `${relevantDoc.section} - ${relevantDoc.title}: ${relevantDoc.content}`;
    } else {
      // Show more content from PDF (up to 2000 characters)
      const content = relevantDoc.content || relevantDoc.pageContent || '';
      answer = `Case ${relevantDoc.section || relevantDoc.metadata?.caseNumber || 'Unknown'}: ${content.substring(0, 2000)}`;
    }

    const isQuotaOrRateLimited = geminiError?.status === 429;

    if (isQuotaOrRateLimited) {
      console.warn('Gemini quota/rate limit exceeded. Using retrieval-only fallback.');
      answer =
        `AI enhancement is temporarily unavailable due to API quota/rate limits. ` +
        `Showing retrieval-based result:\n\n${answer}`;
    } else {
      console.error('Gemini error:', geminiError);
    }
    
    return {
      answer: answer,
      citations: citations,
      section_title: sectionTitle,
      confidence: documents.length > 0 ? 0.7 : 0
    };
  }
}

// Use v1beta API for gemini-1.5-flash model
async function generateWithGemini(prompt) {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent` +
    `?key=${encodeURIComponent(geminiApiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const err = new Error(payload?.error?.message || 'Gemini API request failed');
    err.status = response.status;
    err.code = payload?.error?.status || payload?.error?.code || null;
    throw err;
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part?.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text;
}

/**
 * Handle WebSocket chat events
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('chat:message', async (data) => {
      const { query, sessionId, language = 'en' } = data;
      
      try {
        socket.emit('chat:typing', { isTyping: true });
        
        // Validate and normalize language (fallback to 'en' if unsupported)
        const normalizedLanguage = isSupportedLanguage(language) ? language : 'en';
        
        const retrievalResult = await retrieveAndPrepareContext(query);
        const response = await generateFriendlyResponse(query, retrievalResult, normalizedLanguage);
        
        // Send complete response
        socket.emit('chat:complete', {
          answer: response.answer,
          citations: response.citations,
          section_title: response.section_title,
          confidence: response.confidence,
        });
        
        socket.emit('chat:typing', { isTyping: false });
        
      } catch (error) {
        console.error('Socket chat error:', error);
        socket.emit('chat:error', { error: 'Failed to process request' });
        socket.emit('chat:typing', { isTyping: false });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export default router;
