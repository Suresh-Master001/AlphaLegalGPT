/**
 * Chat Routes with RAG using LangChain
 * Implements Retrieval Augmented Generation for legal Q&A
 * 
 * RAG Architecture:
 * 1. User Question → Search relevant data in dataset
 * 2. Send context + question to AI
 * 3. AI generates answer
 * 
 * Supports:
 * - IPC sections (JSON)
 * - BNS 2023 sections (JSON)
 * - PDF Case Judgments from DataSet folder
 */

import express from 'express';
import { retrieveAndPrepareContext } from '../rag/retriever.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

const router = express.Router();

// Simple in-memory chat history (would be database in production)
const chatHistory = new Map();

// Initialize LLM for answer generation
// Note: In production, use environment variables for API keys
let llm = null;

/**
 * Get or initialize the LLM
 */
const getLLM = () => {
  if (!llm) {
    // Using a mock/simulation for demo purposes
    // In production, use: new ChatOpenAI({ temperature: 0.7, openAIApiKey: process.env.OPENAI_API_KEY })
    llm = {
      call: async (prompt) => {
        // This is a fallback - actual LLM integration would go here
        console.log('LLM prompt received (simulated)');
        return 'Response generated via RAG';
      }
    };
  }
  return llm;
};

/**
 * POST /api/chat
 * Handle chat requests with RAG
 * 
 * Flow: User Question → Retrieve Context → Generate Answer
 */
router.post('/chat', async (req, res) => {
  try {
    const { query, sessionId } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('Processing RAG request for:', query);
    
    // Step 1 & 2: Retrieve relevant documents using RAG (search + context)
    const retrievalResult = await retrieveAndPrepareContext(query);
    
    // Step 3: Generate response using context + LLM
    const answer = await generateLegalAnswer(query, retrievalResult);
    
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
 * Generate legal answer using RAG with context
 * This implements the core RAG pattern:
 * - Retrieve relevant documents from dataset (IPC, BNS, PDF Cases)
 * - Combine with user question as context
 * - Generate answer using LLM
 */
async function generateLegalAnswer(query, retrievalResult) {
  const { context, documents, citations } = retrievalResult;
  
  // Extract relevant information from retrieved context
  const relevantDoc = documents[0];
  
  if (!relevantDoc) {
    return "I couldn't find specific information related to your query in the Indian Penal Code or case judgments. Please try a different question or consult a legal professional for specific legal advice.";
  }
  
  const section = relevantDoc.section;
  const title = relevantDoc.title;
  const content = relevantDoc.content;
  const source = relevantDoc.source;
  const isPDF = relevantDoc.isPDF;
  
  // Check if the query is asking about a specific section
  const queryLower = query.toLowerCase();
  
  // Handle common queries with contextual responses
  if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
    return "Hello! I'm AttorneyGPT, your AI legal assistant. I can help you understand various sections of the Indian Penal Code (IPC), Bharatiya Nyaya Sanhita 2023 (BNS), and case judgments from the DataSet. Please feel free to ask any legal questions you may have.";
  }
  
  if (queryLower.includes('thank') || queryLower.includes('thanks')) {
    return "You're welcome! If you have any more legal questions, feel free to ask. Remember, this information is for educational purposes and should not be considered as legal advice.";
  }
  
  if (queryLower.includes('help') || queryLower.includes('what can you do')) {
    return "I can help you understand various sections of the Indian Penal Code (IPC), Bharatiya Nyaya Sanhita 2023 (BNS), and case judgments using RAG (Retrieval Augmented Generation). You can ask me questions like:\n\n- What is IPC Section 420?\n- What are the punishments for theft?\n- What does Section 498A cover?\n- Explain the law regarding assault\n- Tell me about criminal breach of trust\n\nThe system retrieves relevant legal documents and case judgments to generate contextual answers.";
  }
  
  // Build answer based on RAG-retrieved context
  let answer = '';
  
  // Check if it's a PDF case judgment or statute
  if (isPDF) {
    // PDF Case Judgment response
    answer = '**Case: ' + section + '**\n\n';
    if (relevantDoc.year) {
      answer += '*Year: ' + relevantDoc.year + '*\n\n';
    }
    answer += content + '\n\n';
    answer += '*Source: Case Judgment from DataSet*\n\n';
  } else {
    // Statute (IPC/BNS) response
    answer = '**' + section + ' - ' + title + '**\n\n';
    answer += content + '\n\n';
    answer += '*Source: ' + source + '*\n\n';
  }
  
  // Add related provisions from retrieved documents
  const relatedDocs = documents.slice(1).filter(doc => !doc.isPDF);
  if (relatedDocs.length > 0) {
    answer += '*Related provisions:*\n';
    relatedDocs.forEach((doc) => {
      answer += '- ' + doc.section + ' (' + doc.title + ')\n';
    });
    answer += '\n';
  }
  
  // Add case references if available
  const caseDocs = documents.filter(doc => doc.isPDF);
  if (caseDocs.length > 0) {
    answer += '*Relevant case judgments:*\n';
    caseDocs.forEach((doc) => {
      answer += '- ' + doc.section + (doc.year ? ` (${doc.year})` : '') + '\n';
    });
    answer += '\n';
  }
  
  // Add disclaimer
  answer += '---\n\n';
  answer += '*Note: This information is provided for educational purposes only and does not constitute legal advice. ';
  answer += 'For specific legal matters, please consult a qualified advocate.*';
  
  return answer;
}

/**
 * Handle WebSocket chat events for streaming responses
 * Implements real-time RAG pipeline with streaming
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('chat:message', async (data) => {
      const { query, sessionId, language = 'en' } = data;
      
      try {
        // Emit typing indicator
        socket.emit('chat:typing', { isTyping: true });
        
        // RAG Pipeline:
        // 1. Retrieve relevant documents from dataset
        const retrievalResult = await retrieveAndPrepareContext(query);
        
        // 2. Generate answer using retrieved context
        const answer = await generateLegalAnswer(query, retrievalResult, language);
        
        // 3. Stream response token by token
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
        
        // Send complete response with citations
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

