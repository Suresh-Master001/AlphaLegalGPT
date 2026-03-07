/**
 * Simple embeddings using cosine similarity
 * No external API required - uses TF-IDF style approach
 */

// Simple hash function for creating pseudo-embeddings
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Convert text to a simple numerical vector
function textToVector(text) {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(100).fill(0);
  
  words.forEach((word, index) => {
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
 */
export const createEmbeddings = () => {
  return {
    embedQuery: async (text) => {
      return textToVector(text);
    },
    embedDocuments: async (documents) => {
      return documents.map(doc => textToVector(doc));
    }
  };
};

/**
 * Generate embeddings for a single text
 */
export const generateEmbedding = async (text, embeddings) => {
  try {
    return await embeddings.embedQuery(text);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

/**
 * Generate embeddings for multiple texts
 */
export const generateEmbeddings = async (texts, embeddings) => {
  try {
    return await embeddings.embedDocuments(texts);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

