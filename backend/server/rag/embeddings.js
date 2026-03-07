
/**
 * LangChain-based embeddings for RAG Pipeline
 * Implements proper text embeddings for legal document retrieval
 * 
 * This module provides embeddings using LangChain's integration
 */

// Try different import paths based on LangChain version
let HuggingFaceEmbeddings;
try {
  // Try @langchain/community first (newer versions)
  const community = await import('@langchain/community');
  HuggingFaceEmbeddings = community.HuggingFaceEmbeddings;
} catch (e1) {
  try {
    // Try langchain/embeddings directly
    const langchain = await import('langchain');
    HuggingFaceEmbeddings = langchain.embeddings.HuggingFaceEmbeddings;
  } catch (e2) {
    console.log('Using fallback embeddings implementation');
  }
}

/**
 * Create embeddings model
 * Falls back to simple hash-based embeddings if LangChain not available
 */
export const createEmbeddings = () => {
  if (HuggingFaceEmbeddings) {
    return new HuggingFaceEmbeddings({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      timeout: 30000,
    });
  }
  
  // Fallback: Simple hash-based embeddings
  return {
    embedQuery: async (text) => textToVector(text),
    embedDocuments: async (documents) => documents.map(doc => textToVector(doc))
  };
};

// Simple hash function for creating pseudo-embeddings as fallback
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Convert text to a simple numerical vector (fallback)
function textToVector(text) {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(100).fill(0);
  
  words.forEach((word) => {
    const hash = simpleHash(word);
    vector[Math.abs(hash) % 100] += 1;
  });
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return vector.map(val => val / magnitude);
  }
  return vector;
}

/**
 * Generate embedding for a single text query
 */
export const generateEmbedding = async (text) => {
  const embeddings = createEmbeddings();
  return await embeddings.embedQuery(text);
};

/**
 * Generate embeddings for multiple documents
 */
export const generateEmbeddings = async (texts) => {
  const embeddings = createEmbeddings();
  return await embeddings.embedDocuments(texts);
};

export default createEmbeddings;

