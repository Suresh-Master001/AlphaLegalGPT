
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
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { retrieveAndPrepareContext } from '../rag/retriever.js';
import { 
  getGreetingResponse, 
  getErrorResponse, 
  isSupportedLanguage 
} from '../i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const router = express.Router();

const systemPrompt = `
You are AttorneyGPT, a professional AI legal assistant designed to answer questions about the Indian Penal Code (IPC).

Your job is to help users understand IPC laws in a simple and accurate way using the provided legal dataset.

Core Responsibilities:

1. Understand the user’s query from the chat window.
2. Identify the relevant IPC section from the provided dataset.
3. Answer in clear and simple language.
4. Provide the IPC section number and title.
5. Return responses in structured JSON format.

Response Format:

{
  "answer": "Simple explanation of the law",
  "citations": ["IPC Section Number"],
  "section_title": "Official section title",
  "confidence": 0.85
}

Response Guidelines:

• Always base your answer only on the provided IPC dataset.
• Do not invent laws or legal sections.
• If multiple sections are relevant, return the most relevant one.
• Use simple language suitable for general users.
• Avoid complex legal jargon unless necessary.

Semantic Understanding:

The user may not always mention the exact IPC section.

Examples:

If user asks:
"What law punishes cheating in India?"

You should match it to:
IPC Section 420 – Cheating and dishonestly inducing delivery of property.

If user asks:
"What happens if someone steals a bike?"

You should match it to:
IPC Section 379 – Theft.

Multilingual Support:

You may receive queries in English or Tamil.

Examples:

Tamil Query:
"IPC 420 என்றால் என்ன?"

Interpretation:
Explain IPC Section 420.

Tamil Query:
"திருட்டுக்கு இந்திய சட்டத்தில் என்ன தண்டனை?"

Interpretation:
IPC Section 379 – Theft.

Fallback Rule:

If no relevant IPC section is found in the dataset, respond with:

{
  "answer": "I could not find an exact IPC reference for your question. Please consult a legal professional.",
  "citations": [],
  "section_title": null,
  "confidence": 0.0
}

Professional Tone:

• Neutral
• Informative
• Helpful
• Non-judgmental

Example Response:

User Query:
"What is IPC Section 420?"

Response:

{
  "answer": "IPC Section 420 deals with cheating and dishonestly inducing a person to deliver property. If someone deceives another person to obtain money or property, they can be punished under this section.",
  "citations": ["IPC Section 420"],
  "section_title": "Cheating and dishonestly inducing delivery of property",
  "confidence": 0.92
}
`;

const rawApiKey = process.env.GEMINI_API_KEY || "";
const geminiApiKey = rawApiKey.trim();
console.log('GEMINI_API_KEY loaded:', geminiApiKey ? geminiApiKey.substring(0, 15) + '...' : 'EMPTY');
const geminiModel = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

const canUseGemini =
  !!geminiApiKey &&
  !geminiApiKey.startsWith('replace_with') &&
  geminiApiKey !== 'YOUR_API_KEY_HERE';

if (!canUseGemini) {
  console.warn('WARNING: Using placeholder API key - Gemini calls will fail. Please add valid API key to backend/.env');
}

// Simple in-memory chat history
const chatHistory = new Map();

const COMPLEX_KEYWORDS = [
  'explain',
  'analysis',
  'analyze',
  'difference',
  'compare',
  'procedure',
  'steps',
  'how to',
  'what is the punishment',
  'appeal',
  'bail',
  'jurisdiction',
  'cognizable',
  'non-cognizable',
  'compoundable',
  'summary',
];

const isComplexQuery = (query) => {
  const text = (query || '').trim();
  if (!text) return false;
  const wordCount = text.split(/\s+/).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const lower = text.toLowerCase();
  const hasKeyword = COMPLEX_KEYWORDS.some((kw) => lower.includes(kw));
  return wordCount >= 18 || text.length >= 120 || questionCount > 1 || hasKeyword;
};

const buildRetrievalOnlyResponse = (retrievalResult) => {
  const { documents, citations, confidence } = retrievalResult;
  const relevantDoc = documents[0];
  if (!relevantDoc) {
    return {
      answer: "I could not find an exact IPC reference for your question. Please consult a legal professional.",
      citations: [],
      section_title: "",
      confidence: 0
    };
  }

  const sectionTitle = relevantDoc.title || relevantDoc.section || '';
  let answer = '';
  if (relevantDoc.isStatute) {
    answer = `${relevantDoc.section} - ${relevantDoc.title}: ${relevantDoc.content}`;
  } else {
    const content = relevantDoc.content || relevantDoc.pageContent || '';
    answer = `Case ${relevantDoc.section || relevantDoc.metadata?.caseNumber || 'Unknown'}: ${content.substring(0, 2000)}`;
  }

  return {
    answer: formatResponseAnswer(answer, 200),
    citations: citations || [],
    section_title: sectionTitle,
    confidence: confidence || (documents.length > 0 ? 0.7 : 0)
  };
};

const formatResponseAnswer = (text, maxWords = 200) => {
  const safeText = String(text || '').replace(/\s+/g, ' ').trim();
  if (!safeText) return '';

  const words = safeText.split(' ');
  const trimmed = words.slice(0, Math.max(1, maxWords)).join(' ');

  const rawPoints = trimmed
    .split(/(?:\n+|\. |\? |\! )/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const points = rawPoints.length > 0 ? rawPoints : [trimmed];
  const maxPoints = 8;
  const finalPoints = points.slice(0, maxPoints);

  return finalPoints.map((p) => `- ${p.replace(/[.:;,\s]+$/g, '')}.`).join('\n');
};

const reformatWithGemini = async (response, language = 'en') => {
  if (!canUseGemini) {
    return {
      ...response,
      answer: formatResponseAnswer(response.answer, 200)
    };
  }

  const languageInstruction = language === 'ta'
    ? 'Respond in Tamil language (தமிழ்).'
    : 'Respond in English.';

  const prompt = `
You are formatting a legal assistant response. Output ONLY valid JSON (no extra text).

Rules:
- Keep the meaning faithful to the provided answer and citations.
- Format the answer as point-by-point bullet list.
- Summarize to a maximum of 200 words.
- Preserve section title and citations.
- If citations are empty, keep them empty.

${languageInstruction}

Input JSON:
${JSON.stringify({
  answer: response.answer,
  citations: response.citations,
  section_title: response.section_title,
  confidence: response.confidence
})}

Output JSON format:
{
  "answer": "- point one\\n- point two",
  "citations": ["IPC Section Number"],
  "section_title": "Official section title",
  "confidence": 0.85
}
`;

  try {
    const responseText = await generateWithGemini(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        answer: formatResponseAnswer(parsed.answer || response.answer, 200),
        citations: Array.isArray(parsed.citations) ? parsed.citations : response.citations,
        section_title: parsed.section_title || response.section_title,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : response.confidence
      };
    }
  } catch (error) {
    console.warn('Gemini reformat failed, using local formatting:', error.message);
  }

  return {
    ...response,
    answer: formatResponseAnswer(response.answer, 200)
  };
};

/**
 * POST /api/chat
 * Handle chat requests with RAG + Gemini
 * Supports language parameter: 'en' (English) or 'ta' (Tamil)
 */
router.post('/', async (req, res) => {
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

    // Step 2: Use Gemini only for complex queries; simple queries return retrieval-only response
    const useGemini = isComplexQuery(query);
    let response = useGemini
      ? await generateFriendlyResponse(query, retrievalResult, normalizedLanguage)
      : buildRetrievalOnlyResponse(retrievalResult);
    response = await reformatWithGemini(response, normalizedLanguage);
    
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

router.get('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = chatHistory.get(sessionId) || [];
  res.json({ history });
});

router.delete('/history/:sessionId', (req, res) => {
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
    const errorResponse = getErrorResponse('noReference', language);
    return {
      ...errorResponse,
      answer: formatResponseAnswer(errorResponse.answer, 200)
    };
  }
  
  // Check for greetings using i18n
  const greetingResponse = getGreetingResponse(query, language);
  if (greetingResponse) {
    return {
      ...greetingResponse,
      answer: formatResponseAnswer(greetingResponse.answer, 200)
    };
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
  
  // Create prompt for Gemini with language instruction
  const languageInstruction = language === 'ta' 
    ? `\n\nIMPORTANT: Respond in Tamil language (தமிழ்).`
    : '';
  
  const userMessage = query;
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ];

  const prompt = `${systemPrompt}${languageInstruction}

User Question: ${userMessage}

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
    
    // Translate to Tamil if needed (post-generation)
    let finalAnswer = responseText;
    if (language === 'ta') {
      try {
        const translatePrompt = `Translate the following legal explanation to natural, fluent Tamil (தமிழ்). Keep legal terms accurate. Do not add extra content:

Original: ${responseText}`;
        finalAnswer = await generateWithGemini(translatePrompt);
      } catch (translateError) {
        console.warn('Translation failed, using original:', translateError.message);
      }
    }

    // Return as structured response
    return {
      answer: formatResponseAnswer(finalAnswer, 200),
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
      answer: formatResponseAnswer(answer, 200),
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
        const useGemini = isComplexQuery(query);
        let response = useGemini
          ? await generateFriendlyResponse(query, retrievalResult, normalizedLanguage)
          : buildRetrievalOnlyResponse(retrievalResult);
        response = await reformatWithGemini(response, normalizedLanguage);
        
        // Translate to Tamil if needed (post-generation for streaming)
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
