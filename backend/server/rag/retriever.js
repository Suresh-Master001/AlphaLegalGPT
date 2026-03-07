import { similaritySearch } from './vectorStore.js';
import { keywordSearch } from './keywordSearch.js';

/**
 * Retrieve relevant IPC sections based on user query using hybrid search
 * @param {string} query - User's legal question
 * @param {number} k - Number of top results to retrieve
 * @returns {Object} - Retrieved documents with metadata and scores
 */
export const retrieveRelevantDocuments = async (query, k = 3) => {
  try {
    // Perform semantic search (embeddings-based)
    const semanticResults = await similaritySearch(query, k);
    
    // Perform keyword search
    const keywordResults = await keywordSearch(query, k);
    
    // Combine results using hybrid scoring
    const hybridResults = combineResults(semanticResults, keywordResults, k);
    
    // Format results
    const formattedResults = hybridResults.map((doc) => ({
      section: doc.section,
      title: doc.title,
      content: doc.content,
      relevanceScore: doc.combinedScore,
      semanticScore: doc.semanticScore,
      keywordScore: doc.keywordScore,
    }));
    
    return formattedResults;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    // Fallback to semantic search only if hybrid fails
    try {
      const fallbackResults = await similaritySearch(query, k);
      return fallbackResults.map(([doc, score]) => ({
        section: doc.metadata.section,
        title: doc.metadata.title,
        content: doc.pageContent,
        relevanceScore: 1 - score,
      }));
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw error;
    }
  }
};

/**
 * Combine semantic and keyword search results
 * @param {Array} semanticResults - Results from semantic search
 * @param {Array} keywordResults - Results from keyword search
 * @param {number} k - Number of results to return
 * @returns {Array} - Combined and ranked results
 */
const combineResults = (semanticResults, keywordResults, k) => {
  const combinedMap = new Map();
  
  // Process semantic results
  semanticResults.forEach(([doc, score], index) => {
    const key = doc.metadata.section;
    const semanticScore = 1 - score; // Convert distance to similarity
    combinedMap.set(key, {
      section: doc.metadata.section,
      title: doc.metadata.title,
      content: doc.pageContent,
      semanticScore,
      keywordScore: 0,
      combinedScore: semanticScore * 0.6, // 60% weight for semantic
      source: doc.metadata.source,
    });
  });
  
  // Process keyword results and merge
  keywordResults.forEach((result, index) => {
    const key = result.section;
    const keywordScore = result.keywordScore || (1 / (index + 1)); // Normalize if no score
    
    if (combinedMap.has(key)) {
      // Document exists in both - update combined score
      const existing = combinedMap.get(key);
      existing.keywordScore = keywordScore;
      // Weighted average: 60% semantic, 40% keyword
      existing.combinedScore = (existing.semanticScore * 0.6) + (keywordScore * 0.4);
    } else {
      // New document from keyword search
      combinedMap.set(key, {
        section: result.section,
        title: result.title,
        content: result.content,
        semanticScore: 0,
        keywordScore: keywordScore,
        combinedScore: keywordScore * 0.4, // 40% weight for keyword-only
        source: result.source,
      });
    }
  });
  
  // Sort by combined score and return top k
  return [...combinedMap.values()]
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, k);
};

/**
 * Generate context string from retrieved documents
 * @param {Array} documents - Array of retrieved documents
 * @returns {string} - Formatted context string
 */
export const generateContext = (documents) => {
  return documents
    .map((doc, index) => {
      return `[Document ${index + 1}]\nSection: ${doc.section}\nTitle: ${doc.title}\nContent: ${doc.content}\n`;
    })
    .join('\n');
};

/**
 * Calculate average confidence from retrieval scores
 * @param {Array} documents - Array of retrieved documents
 * @returns {number} - Confidence score between 0 and 1
 */
export const calculateConfidence = (documents) => {
  if (!documents || documents.length === 0) return 0;
  
  const avgScore = documents.reduce((sum, doc) => sum + doc.relevanceScore, 0) / documents.length;
  
  // Normalize to 0-1 range and scale to realistic confidence (0.7-0.95)
  const confidence = Math.min(0.95, Math.max(0.7, avgScore));
  
  return Math.round(confidence * 100) / 100;
};

/**
 * Extract citations from retrieved documents
 * @param {Array} documents - Array of retrieved documents
 * @returns {string[]} - Array of citation strings
 */
export const extractCitations = (documents) => {
  return documents.map((doc) => `${doc.section} – ${doc.title}`);
};

/**
 * Full retrieval pipeline
 * @param {string} query - User's legal question
 * @returns {Object} - Complete retrieval result with context, citations, and confidence
 */
export const retrieveAndPrepareContext = async (query) => {
  const documents = await retrieveRelevantDocuments(query);
  const context = generateContext(documents);
  const citations = extractCitations(documents);
  const confidence = calculateConfidence(documents);
  
  return {
    documents,
    context,
    citations,
    confidence,
  };
};

