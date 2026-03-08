/**
 * Embeddings for RAG Pipeline
 * Implements text embeddings for legal document retrieval
 * 
 * Uses HuggingFace sentence-transformers via LangChain when available,
 * Falls back to simple hash-based embeddings otherwise
 */

let HuggingFaceEmbeddings = null;
let embeddingsInstance = null;

// Try to load LangChain/HuggingFace embeddings
try {
  // Dynamic import for ES modules
  const { HuggingFaceEmbeddings: HF } = await import('@langchain/community');
  HuggingFaceEmbeddings = HF;
  console.log('Loaded HuggingFaceEmbeddings from @langchain/community');
} catch (e1) {
  try {
    // Try alternative import path
    const langchainModule = await import('langchain');
    if (langchainModule.HuggingFaceEmbeddings) {
      HuggingFaceEmbeddings = langchainModule.HuggingFaceEmbeddings;
      console.log('Loaded HuggingFaceEmbeddings from langchain');
    }
  } catch (e2) {
    console.log('LangChain not available, using fallback embeddings');
  }
}

/**
 * Simple hash function for creating pseudo-embeddings as fallback
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Convert text to a simple numerical vector (fallback)
 */
function textToVector(text) {
  if (!text || typeof text !== 'string') {
    return new Array(100).fill(0);
  }
  
  const words = text.toLowerCase().split(/\s+/).filter(t => t.length > 0);
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
 * Create embeddings model
 * Falls back to simple hash-based embeddings if LangChain not available
 */
export const createEmbeddings = () => {
  if (embeddingsInstance) {
    return embeddingsInstance;
  }

  if (HuggingFaceEmbeddings) {
    try {
      embeddingsInstance = new HuggingFaceEmbeddings({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        timeout: 30000,
      });
      console.log('Using HuggingFace embeddings model');
      return embeddingsInstance;
    } catch (error) {
      console.warn('Failed to initialize HuggingFace embeddings:', error.message);
    }
  }
  
  // Fallback: Simple hash-based embeddings
  console.log('Using fallback hash-based embeddings');
  return {
    embedQuery: async (text) => {
      if (!text) return new Array(100).fill(0);
      return textToVector(text);
    },
    embedDocuments: async (documents) => {
      if (!Array.isArray(documents)) return [new Array(100).fill(0)];
      return documents.map(doc => textToVector(doc));
    }
  };
};

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

