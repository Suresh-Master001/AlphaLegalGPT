import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Chat } from '../data/models/Chat.js';
import { User } from '../data/models/User.js';
import { GlobalHistory } from '../data/models/GlobalHistory.js';
import { LocalSearch } from '../data/search/LocalSearch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
    } catch (error) {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

// Cache API key to avoid reloading .env on every request
let cachedApiKey = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getApiKey = () => {
  const now = Date.now();
  if (!cachedApiKey || (now - lastCacheTime) > CACHE_DURATION) {
    dotenv.config({ path: join(__dirname, '../../.env'), override: true });
    cachedApiKey = process.env.GEMINI_API_KEY?.trim();
    lastCacheTime = now;
  }
  return cachedApiKey;
};

const getGenAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('❌ Chat API: GEMINI_API_KEY is missing in .env!');
  } else {
    // console.log(`🔑 Chat API: Using key starting with: ${apiKey.slice(0, 10)}... (Reloaded)`);
  }
  return new GoogleGenerativeAI(apiKey || '');
};

const LEGAL_FALLBACK_EN = "I am sorry, but I am an AI Legal Assistant and I can only help with law or legal-related questions.";
const LEGAL_FALLBACK_TA = "மன்னிக்கவும், நான் ஒரு AI சட்ட உதவியாளர் மற்றும் சட்டம் தொடர்பான கேள்விகளுக்கு மட்டுமே என்னால் உதவ முடியும்.";

const getSystemPrompt = (languageCode, location) => {
  const isTamil = languageCode === 'ta' || languageCode === 'tamil';
  // Dynamic language selection based on user's preference
  const defaultLanguage = isTamil ? "Tamil" : "English";
  const fallbackMessage = isTamil ? LEGAL_FALLBACK_TA : LEGAL_FALLBACK_EN;

  const distanceConstraint = `
STRICT CONSTRAINT: You MUST only suggest offices within a 1 meter to 10 km radius. Do NOT provide "long directions" (beyond 10km). If an office is likely further away, inform the user you cannot find any within the 10km limit.
Always add a note: "${isTamil ? '10 கி.மீ சுற்றளவுக்குள் அலுவலகங்களைத் தேடுகிறது...' : 'Searching for offices within a 10 km radius...'}" when providing these links.
`;

  let locationContext = "";
  if (location && location.lat && location.lng) {
    locationContext = `
USER LOCATION: Latitude ${location.lat}, Longitude ${location.lng}
The user HAS enabled location sharing. Your primary goal is to guide them to the ACTUAL physical offices where they can solve their legal issue.
Whenever the user's question relates to a specific government service or legal process, you MUST provide a Google Maps search link for the relevant office nearby.

${distanceConstraint}

- Supreme Court: https://www.google.com/maps/search/Supreme+Court+of+India/@${location.lat},${location.lng},13z
- High Court: https://www.google.com/maps/search/High+Court/@${location.lat},${location.lng},13z
- District/Sessions/Magistrate Court: https://www.google.com/maps/search/District+Court/@${location.lat},${location.lng},13z
- Police Station (AWPS/Traffic/Cyber): https://www.google.com/maps/search/Police+Station/@${location.lat},${location.lng},13z
- CBI/NIA/ED/NCB: https://www.google.com/maps/search/CBI+office/@${location.lat},${location.lng},13z
- VAO/RI/Taluk/Collector Office: https://www.google.com/maps/search/Taluk+Office/@${location.lat},${location.lng},13z
- BDO Office / Panchayat Union: https://www.google.com/maps/search/BDO+Office/@${location.lat},${location.lng},13z
- Agriculture Office: https://www.google.com/maps/search/Agriculture+Office/@${location.lat},${location.lng},13z
- Veterinary Hospital: https://www.google.com/maps/search/Veterinary+Hospital/@${location.lat},${location.lng},13z
- Primary Health Centre (PHC): https://www.google.com/maps/search/PHC+Hospital/@${location.lat},${location.lng},13z
- Ration Shop / PDS Center: https://www.google.com/maps/search/Ration+Shop/@${location.lat},${location.lng},13z
- Human Rights/Women Commission: https://www.google.com/maps/search/Human+Rights+Commission/@${location.lat},${location.lng},13z
- Municipality/Corporation/Water Board: https://www.google.com/maps/search/Municipality+Office/@${location.lat},${location.lng},13z
- Electricity Board (EB/TANGEDCO): https://www.google.com/maps/search/EB+Office/@${location.lat},${location.lng},13z

${isTamil ? 'முக்கியக் குறிப்பு: ஒரு அலுவலகம் 10 கிமீ சுற்றளவுக்கு வெளியே இருந்தால், அதைத் தெளிவாகக் குறிப்பிடவும் (எ.கா. "இந்த அலுவலகம் 10 கிமீ சுற்றளவுக்கு வெளியே உள்ளது").' : 'IMPORTANT: If an office is likely outside the 10km radius (e.g. Supreme Court, High Court, CBI HQ), explicitly mention: "This office is likely outside the 10km radius".'}

Always tell the user: "${isTamil ? 'அருகிலுள்ள [Office Name] ஐ 10 கிமீக்குள் இங்கே காணலாம்: [Link]' : 'You can find the nearest [Office Name] within 10 km here: [Link]'}"
`;
  } else {
    locationContext = `
USER LOCATION: [NOT PROVIDED]
The user has NOT enabled location sharing or it is unavailable.
${distanceConstraint}
If the user asks for directions or nearby offices, you MUST NOT guess any address. Instead, politely ask the user to enable their location using the map icon in the chat input to find offices within a 10km radius.
`;
  }

  return `You are AI LegalGPT, a professional Indian legal assistant.
Your scope is STRICTLY LIMITED to law, legal procedures, Indian statutes, and legal advice.
If a user asks a question that is NOT related to law or legal matters (e.g., general knowledge, personal advice, random facts, jokes, or non-legal topics), you MUST NOT answer it.
Instead, you must respond ONLY with the following exact message: "${fallbackMessage}"
${locationContext}
IMPORTANT: 
1. You MUST answer strictly in the ${defaultLanguage} language.
2. If the user specifically requests a different language (e.g., "in Tamil", "in English"), you can use that language.
3. Do not mention datasets or training data.
4. Provide simple, accurate explanations of Indian law suitable for the general public.`;
};

// POST /api/chat
router.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { query, language, location, realtime } = req.body;
    const isRealtimeRequest = realtime !== false;
    const apiKey = getApiKey();

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Processing AI LegalGPT request: ${query} (Language: ${language}, RT: ${isRealtimeRequest}, Key: ${apiKey ? 'Yes' : 'No'})`);

    let answer = "";
    let isFromHistory = false;
    let fallbackUsed = false;

    // SCENARIO 1: Real-time is ON and API Key exists
    if (isRealtimeRequest && apiKey) {
      try {
        // Check database/history first to handle rate limits / cache matches
        const historyMatch = await LocalSearch.findInHistory(query);
        if (historyMatch && historyMatch.score >= 0.7) {
          console.log(`🎯 Cache Hit! Serving from history (Score: ${historyMatch.score}) to prevent rate limits.`);
          answer = historyMatch.answer;
          isFromHistory = true;
        } else {
          const genAI = getGenAI();
          const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
          const fullPrompt = `${getSystemPrompt(language, location)}\n\nUser Question:\n${query}`;

          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          answer = response.text();
          
          // ONLY Save to Global History (Our "dataset") if it's a valid legal response
          // Avoid saving "I am a legal AI..." refusals for non-legal questions like "what is java"
          const isRefusal = answer.includes(LEGAL_FALLBACK_EN) || answer.includes(LEGAL_FALLBACK_TA);
          if (!isRefusal) {
            await GlobalHistory.save(query, answer);
          }
        }
      } catch (apiError) {
        console.error('🚫 Gemini API Error (HTTP):', apiError.message);
        const historyResult = await LocalSearch.search(query, language);
        answer = historyResult.answer;
        isFromHistory = historyResult.source === 'History';
        fallbackUsed = true;
      }
    } else {
        // SCENARIO 2: Real-time is OFF or API Key is missing
        console.log('ℹ️ Local History Search Mode (RT Off or API Key missing)');
        const historyResult = await LocalSearch.search(query, language);
        answer = historyResult.answer;
        isFromHistory = historyResult.source === 'History';
        fallbackUsed = true;
    }

    // Use answer as primary response without visible prefixes
    const finalAnswer = answer;

    res.json({
      answer: finalAnswer,
      citations: [], 
      section_title: isFromHistory ? "Previous Insight" : (fallbackUsed ? "Local Matching" : ""),
      isOffline: fallbackUsed,
      isFromHistory
    });

    // Save to history asynchronously if user is logged in
    const userId = req.user?.id;
    if (userId) {
      const sessionId = req.body.sessionId || 'default';
      const existingChat = await Chat.findSession(userId, sessionId);

      const userMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      };

      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...(existingChat?.messages || []), userMessage, aiMessage];

      // Auto-generate title if it's the first message
      let title = existingChat?.title || 'New Chat';
      if (title === 'New Chat' || !existingChat) {
        title = query.slice(0, 30) + (query.length > 30 ? '...' : '');
      }

      await Chat.saveOrUpdate(userId, {
        id: sessionId,
        title,
        messages: updatedMessages
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: "Failed to get response from AI LegalGPT",
      details: error.message
    });
  }
});

// GET /api/chat/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.findByUser(userId);
    res.json({ history: chats });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const chat = await Chat.findSession(userId, sessionId);
    res.json({ history: chat ? chat.messages : [] });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

// DELETE /api/chat/history/:sessionId
router.get('/clear-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await Chat.clear(userId);
    res.json({ success: true, message: 'All chat history cleared' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

router.delete('/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    await Chat.delete(userId, sessionId);
    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});
/**
 * Handle WebSocket chat events
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('chat:message', async (data) => {
      const { query, language, sessionId, token, location, realtime } = data;
      const isRealtimeRequest = realtime !== false;
      const apiKey = getApiKey(); // Reload fresh every time

      let userId = 'anonymous';
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch (err) {
          console.error('Socket token verification failed:', err);
        }
      }

      try {
        socket.emit('chat:typing', { isTyping: true });

        let fullResponseText = "";
        let isFromHistory = false;
        let fallbackUsed = false;

        // Try Gemini only if allowed and key exists
        if (isRealtimeRequest && apiKey) {
          try {
            // Check database/history first to handle rate limits / cache matches
            const historyMatch = await LocalSearch.findInHistory(query);
            if (historyMatch && historyMatch.score >= 0.7) {
              console.log(`🎯 Socket Cache Hit! Serving from history (Score: ${historyMatch.score}) to prevent rate limits.`);
              fullResponseText = historyMatch.answer;
              isFromHistory = true;
              socket.emit('chat:stream', { text: fullResponseText });
            } else {
              const genAI = getGenAI();
              const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
              const fullPrompt = `${getSystemPrompt(language, location)}\n\nUser Question:\n${query}`;

              // Use streaming for better responsiveness
              const result = await model.generateContentStream(fullPrompt);

              for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponseText += chunkText;
                socket.emit('chat:stream', { text: chunkText });
              }
              
              // ONLY Save to Global History if it's a valid legal response
              const isRefusal = fullResponseText.includes(LEGAL_FALLBACK_EN) || fullResponseText.includes(LEGAL_FALLBACK_TA);
              if (!isRefusal) {
                await GlobalHistory.save(query, fullResponseText);
              }
            }
          } catch (apiError) {
            console.error('🚫 Socket Gemini Error:', apiError.message);
            const historyResult = await LocalSearch.search(query, language);
            fullResponseText = historyResult.answer;
            isFromHistory = historyResult.source === 'History';
            fallbackUsed = true;
            socket.emit('chat:stream', { text: fullResponseText });
          }
        } else {
            // Forced history mode
            const historyResult = await LocalSearch.search(query, language);
            fullResponseText = historyResult.answer;
            isFromHistory = historyResult.source === 'History';
            fallbackUsed = true;
            socket.emit('chat:stream', { text: fullResponseText });
        }

        const finalAnswer = fullResponseText;

        socket.emit('chat:complete', {
          answer: finalAnswer,
          sessionId: sessionId || 'default',
          citations: [],
          section_title: isFromHistory ? "Previous Insight" : (fallbackUsed ? "Local Matching" : ""),
          isOffline: fallbackUsed,
          isFromHistory
        });

        // Save to history in background
        if (userId !== 'anonymous') {
          const sId = sessionId || 'default';
          const existingChat = await Chat.findSession(userId, sId);

          let title = existingChat?.title || 'New Chat';
          if (title === 'New Chat' || !existingChat) {
            title = query.slice(0, 30) + (query.length > 30 ? '...' : '');
          }

          const userMessage = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: query,
            timestamp: new Date().toISOString()
          };

          const aiMessage = {
            id: `msg_${Date.now() + 1}`,
            role: 'assistant',
            content: fullResponseText,
            timestamp: new Date().toISOString()
          };

          const updatedMessages = [...(existingChat?.messages || []), userMessage, aiMessage];
    await Chat.saveOrUpdate(userId, {
            id: sId,
            title,
            messages: updatedMessages
          });
        }

        socket.emit('chat:typing', { isTyping: false });

      } catch (error) {
        console.error('Socket streaming error detailed:', {
          message: error.message,
          status: error.status,
          details: error.errorDetails
        });
        socket.emit('chat:error', {
          error: `AI Error: ${error.message}`,
          details: error.message
        });
        socket.emit('chat:typing', { isTyping: false });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export default router;
