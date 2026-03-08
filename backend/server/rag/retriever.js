/**
 * LangChain-based Retriever for RAG Pipeline
 * Uses hybrid search (semantic + keyword) for legal document retrieval
 * 
 * Supports:
 * - PDF Case Judgments from DataSet folder
 * - IPC sections (JSON)
 * - BNS 2023 sections (JSON)
 */

import { similaritySearch } from './vectorStore.js';
import { getVectorStore } from './vectorStore.js';

/**
 * Simple keyword-based search on loaded documents
 * @param {string} query - User's search query
 * @param {Array} documents - Array of documents to search
 * @returns {Array} - Documents with keyword match scores
 */
function keywordSearch(query, documents) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (queryTerms.length === 0) return [];
  
  const results = [];
  
  for (const doc of documents) {
    const content = doc.pageContent.toLowerCase();
    let matchCount = 0;
    let totalMatches = 0;
    
    for (const term of queryTerms) {
      if (content.includes(term)) {
        matchCount++;
        const regex = new RegExp(term, 'gi');
        const matches = content.match(regex);
        if (matches) {
          totalMatches += matches.length;
        }
      }
    }
    
    if (matchCount > 0) {
      const score = (matchCount / queryTerms.length) * Math.min(1, totalMatches / 5);
      results.push({ doc, score: Math.min(1, score) });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Retrieve relevant documents based on user query using hybrid search
 * @param {string} query - User's legal question
 * @param {number} k - Number of top results to retrieve
 * @returns {Object} - Retrieved documents with metadata and scores
 */
export const retrieveRelevantDocuments = async (query, k = 5) => {
  try {
    // Get semantic search results
    const semanticResults = await similaritySearch(query, k * 2);
    
    // Get all documents for keyword search
    const vectorStore = await getVectorStore();
    const allDocs = vectorStore.getAllDocuments();
    
    // Perform keyword search
    const keywordResults = keywordSearch(query, allDocs);
    
    // Combine results using weighted scoring
    const combinedMap = new Map();
    
    // Process semantic results (50% weight)
    semanticResults.forEach(([doc, distance]) => {
      const key = doc.metadata.section || doc.metadata.caseNumber || doc.metadata.fileName;
      const semanticScore = 1 - distance;
      combinedMap.set(key, {
        doc,
        semanticScore,
        keywordScore: 0,
        combinedScore: semanticScore * 0.5
      });
    });
    
    // Process keyword results (50% weight)
    keywordResults.forEach(({ doc, score }) => {
      const key = doc.metadata.section || doc.metadata.caseNumber || doc.metadata.fileName;
      
      if (combinedMap.has(key)) {
        const existing = combinedMap.get(key);
        existing.keywordScore = score;
        existing.combinedScore = (existing.semanticScore * 0.5) + (score * 0.5);
      } else {
        combinedMap.set(key, {
          doc,
          semanticScore: 0,
          keywordScore: score,
          combinedScore: score * 0.5
        });
      }
    });
    
    // Sort by combined score and get top k
    const sortedResults = [...combinedMap.values()]
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, k);
    
    // Format results
    const formattedResults = sortedResults.map(({ doc, semanticScore, keywordScore, combinedScore }) => {
      const metadata = doc.metadata || {};
      const isStatute = metadata.isStatute;
      
      return {
        section: metadata.section || metadata.caseNumber || 'Unknown',
        title: metadata.title || metadata.caseNumber || (isStatute ? 'Legal Section' : 'Case Judgment'),
        content: doc.pageContent,
        relevanceScore: combinedScore,
        semanticScore,
        keywordScore,
        source: metadata.source || 'Unknown',
        year: metadata.year,
        isPDF: !isStatute,
        isStatute: isStatute || false
      };
    });
    
    return formattedResults;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    const results = await similaritySearch(query, k);
    return results.map(([doc, score]) => {
      const metadata = doc.metadata || {};
      return {
        section: metadata.section || metadata.caseNumber || 'Unknown',
        title: metadata.title || metadata.caseNumber || 'Case Judgment',
        content: doc.pageContent,
        relevanceScore: 1 - score,
        semanticScore: 1 - score,
        keywordScore: 0,
        source: metadata.source || 'Unknown',
        year: metadata.year,
        isPDF: !metadata.isStatute,
        isStatute: metadata.isStatute || false
      };
    });
  }
};

/**
 * Generate context string from retrieved documents
 * @param {Array} documents - Array of retrieved documents
 * @returns {string} - Formatted context string for LLM
 */
export const generateContext = (documents) => {
  return documents
    .map((doc, index) => {
      const type = doc.isStatute ? 'Section' : 'Case';
      return `[Document ${index + 1}] ${type}: ${doc.section}\n${doc.content}\n`;
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
  const confidence = Math.min(1, Math.max(0.3, avgScore));
  
  return Math.round(confidence * 100) / 100;
};

/**
 * Extract citations from retrieved documents
 * @param {Array} documents - Array of retrieved documents
 * @returns {string[]} - Array of citation strings
 */
export const extractCitations = (documents) => {
  return documents.map((doc) => {
    const year = doc.year ? ` (${doc.year})` : '';
    return `${doc.section}${year}`;
  });
};

/**
 * Full retrieval pipeline - retrieves context and prepares for LLM
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

export default {
  retrieveRelevantDocuments,
  retrieveAndPrepareContext,
  generateContext,
  calculateConfidence,
  extractCitations,
};
