import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load IPC data
const ipcDataPath = join(__dirname, '../data/ipc_dataset.json');
const ipcData = JSON.parse(readFileSync(ipcDataPath, 'utf-8'));

// Import BNS 2023 data
import bns2023Data from '../data/data.js';

const bnsData = bns2023Data || [];

/**
 * Keyword Search Module
 * Implements TF-IDF based keyword matching for legal queries
 */

class KeywordSearchEngine {
  constructor() {
    this.documents = [];
    this.invertedIndex = new Map();
    this.documentFrequency = new Map();
    this.totalDocuments = 0;
    this.initialized = false;
  }

  /**
   * Initialize the keyword search engine
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing keyword search engine...');

    // Prepare documents from IPC data
    const ipcDocs = ipcData.map((item) => ({
      id: item.section,
      section: item.section,
      title: item.title,
      content: item.content,
      source: 'IPC',
      text: `${item.title} ${item.content}`.toLowerCase(),
    }));

    // Prepare documents from BNS 2023 data
    const bnsDocs = bnsData.map((item) => ({
      id: item.section,
      section: item.section,
      title: item.title,
      content: item.content,
      source: 'BNS 2023',
      text: `${item.title} ${item.content}`.toLowerCase(),
    }));

    // Combine all documents
    this.documents = [...ipcDocs, ...bnsDocs];
    this.totalDocuments = this.documents.length;

    // Build inverted index
    this.buildInvertedIndex();

    // Calculate document frequency
    this.calculateDocumentFrequency();

    this.initialized = true;
    console.log(`Keyword search initialized with ${this.documents.length} documents`);
  }

  /**
   * Build inverted index from documents
   */
  buildInvertedIndex() {
    this.documents.forEach((doc, docIndex) => {
      const tokens = this.tokenize(doc.text);
      const uniqueTokens = [...new Set(tokens)];

      uniqueTokens.forEach(token => {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, []);
        }
        this.invertedIndex.get(token).push(docIndex);
      });
    });
  }

  /**
   * Calculate document frequency for each term
   */
  calculateDocumentFrequency() {
    this.invertedIndex.forEach((docIndices, term) => {
      this.documentFrequency.set(term, docIndices.length);
    });
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    // Remove special characters, convert to lowercase, split into words
    return text
      .replace(/[^\w\s]/g, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out short words
  }

  /**
   * Extract keywords from query
   */
  extractKeywords(query) {
    const tokens = this.tokenize(query);
    
    // Add section numbers if present
    const sectionMatch = query.match(/(?:section|ipc|bns)\s*(\d+[a-z]?)/gi);
    if (sectionMatch) {
      sectionMatch.forEach(match => {
        const sectionNum = match.replace(/[^\d]/g, '');
        if (sectionNum) tokens.push(sectionNum);
      });
    }

    return [...new Set(tokens)];
  }

  /**
   * Calculate TF-IDF score for a term in a document
   */
  calculateTFIDF(term, docIndex) {
    const doc = this.documents[docIndex];
    const tokens = this.tokenize(doc.text);
    
    // Term frequency
    const termCount = tokens.filter(t => t === term).length;
    const tf = termCount / tokens.length;
    
    // Inverse document frequency
    const df = this.documentFrequency.get(term) || 1;
    const idf = Math.log(this.totalDocuments / df);
    
    return tf * idf;
  }

  /**
   * Search documents by keywords
   */
  async search(query, k = 5) {
    await this.initialize();

    const keywords = this.extractKeywords(query);
    console.log('Extracted keywords:', keywords);

    // Score each document
    const scores = new Map();

    keywords.forEach(keyword => {
      // Get documents containing this keyword
      const docIndices = this.invertedIndex.get(keyword) || [];
      
      docIndices.forEach(docIndex => {
        const tfidf = this.calculateTFIDF(keyword, docIndex);
        const currentScore = scores.get(docIndex) || 0;
        scores.set(docIndex, currentScore + tfidf);
      });
    });

    // Also check for section number matches
    const sectionMatch = query.match(/(?:section|ipc|bns)\s*(\d+[a-z]?)/gi);
    if (sectionMatch) {
      sectionMatch.forEach(match => {
        const searchSection = match.toUpperCase();
        
        this.documents.forEach((doc, docIndex) => {
          if (doc.section.toUpperCase().includes(searchSection) || 
              doc.section.toLowerCase().includes(searchSection.toLowerCase())) {
            const currentScore = scores.get(docIndex) || 0;
            scores.set(docIndex, currentScore + 10); // Boost section matches
          }
        });
      });
    }

    // Sort by score and get top k
    const sortedDocs = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, k);

    // Format results
    const results = sortedDocs.map(([docIndex, score]) => {
      const doc = this.documents[docIndex];
      return {
        section: doc.section,
        title: doc.title,
        content: doc.content,
        keywordScore: score,
        source: doc.source,
      };
    });

    return results;
  }

  /**
   * Get all documents (for debugging)
   */
  getAllDocuments() {
    return this.documents;
  }
}

// Singleton instance
let keywordSearchInstance = null;

export const initializeKeywordSearch = async () => {
  const engine = new KeywordSearchEngine();
  await engine.initialize();
  return engine;
};

export const getKeywordSearch = async () => {
  if (!keywordSearchInstance) {
    keywordSearchInstance = await initializeKeywordSearch();
  }
  return keywordSearchInstance;
};

export const keywordSearch = async (query, k = 5) => {
  try {
    const engine = await getKeywordSearch();
    const results = await engine.search(query, k);
    return results;
  } catch (error) {
    console.error('Error in keyword search:', error);
    throw error;
  }
};

export default KeywordSearchEngine;

