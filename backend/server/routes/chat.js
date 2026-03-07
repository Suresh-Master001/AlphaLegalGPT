import express from 'express';
import { retrieveAndPrepareContext } from '../rag/retriever.js';

const router = express.Router();

// Simple in-memory chat history (would be database in production)
const chatHistory = new Map();

/**
 * POST /api/chat
 * Handle chat requests with RAG
 */
router.post('/chat', async (req, res) => {
  try {
    const { query, sessionId } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Retrieve relevant documents using RAG
    const retrievalResult = await retrieveAndPrepareContext(query);
    
    // Generate response using context
    const answer = generateLegalAnswer(query, retrievalResult);
    
    // Store in chat history
    if (!chatHistory.has(sessionId)) {
      chatHistory.set(sessionId, []);
    }
    const history = chatHistory.get(sessionId);
    history.push({ role: 'user', content: query });
    history.push({ role: 'assistant', content: answer, citations: retrievalResult.citations });
    
    // Keep only last 20 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    res.json({
      answer,
      citations: retrievalResult.citations,
      confidence: retrievalResult.confidence,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get chat history for a session
 */
router.get('/chat/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = chatHistory.get(sessionId) || [];
  res.json({ history });
});

/**
 * DELETE /api/chat/history/:sessionId
 * Clear chat history for a session
 */
router.delete('/chat/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  chatHistory.delete(sessionId);
  res.json({ success: true });
});

/**
 * Generate legal answer based on retrieved context
 * Uses rule-based generation with context
 */
function generateLegalAnswer(query, retrievalResult) {
  const { context, documents, citations } = retrievalResult;
  
  // Extract relevant information from context
  const relevantDoc = documents[0];
  
  if (!relevantDoc) {
    return "I couldn't find specific information related to your query in the Indian Penal Code. Please try a different question or consult a legal professional for specific legal advice.";
  }
  
  // Generate answer based on retrieved content
  const section = relevantDoc.section;
  const title = relevantDoc.title;
  const content = relevantDoc.content;
  
  // Check if the query is asking about a specific section
  const sectionMatch = query.match(/section\s*(\d+[a-z]?)/i);
  const queryLower = query.toLowerCase();
  
  let answer = '';
  
  // Check for greetings
  if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
    return "Hello! I'm AttorneyGPT, your AI legal assistant. I can help you understand various sections of the Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita 2023 (BNS). Please feel free to ask any legal questions you may have.";
  }
  
  // Check for thanks
  if (queryLower.includes('thank') || queryLower.includes('thanks')) {
    return "You're welcome! If you have any more legal questions, feel free to ask. Remember, this information is for educational purposes and should not be considered as legal advice.";
  }
  
  // Check for help request
  if (queryLower.includes('help') || queryLower.includes('what can you do')) {
    return "I can help you understand various sections of the Indian Penal Code. You can ask me questions like:\n\n- What is IPC Section 420?\n- What are the punishments for theft?\n- What does Section 498A cover?\n- Explain the law regarding assault\n\nFeel free to ask any legal question!";
  }
  
  // Generate contextual answer
  answer = `**${section} - ${title}**\n\n${content}\n\n`;
  
  // Add additional context if multiple relevant sections found
  if (documents.length > 1) {
    answer += `\n*Related provisions:*\n`;
    documents.slice(1).forEach((doc) => {
      answer += `- ${doc.section} (${doc.title})\n`;
    });
  }
  
  answer += `\n---\n\n*Note: This information is provided for educational purposes only and does not constitute legal advice. For specific legal matters, please consult a qualified advocate.*`;
  
  return answer;
}

/**
 * Handle WebSocket chat events for streaming
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('chat:message', async (data) => {
      const { query, sessionId, language = 'en' } = data;
      
      try {
        // Emit typing indicator
        socket.emit('chat:typing', { isTyping: true });
        
        // Retrieve relevant documents
        const retrievalResult = await retrieveAndPrepareContext(query);
        
        // Generate answer
        const answer = generateLegalAnswer(query, retrievalResult, language);
        
        // Stream response token by token
        const tokens = answer.split(/(?=[ \n])/);
        let streamedResponse = '';
        
        for (const token of tokens) {
          streamedResponse += token;
          socket.emit('chat:streaming', { 
            text: token,
            partial: true 
          });
          
          // Small delay for streaming effect
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Send complete response
        socket.emit('chat:complete', {
          answer: streamedResponse,
          citations: retrievalResult.citations,
          confidence: retrievalResult.confidence,
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

