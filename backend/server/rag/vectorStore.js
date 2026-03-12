/**
 * Vector Store for RAG Pipeline
 * Implements document storage with embeddings for semantic search
 * 
 * Using:
 * - IPC sections (from HuggingFace/Kaggle with local fallback)
 * - IPC PDF Data (IPC_DataPDF.pdf)
 * - BNS 2023 sections (JSON from data folder)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createEmbeddings } from './embeddings.js';
import { loadIPCDataset } from '../data/kaggleLoader.js';
import { loadAllPDFDocuments } from './pdfLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load IPC data from Kaggle/HuggingFace with local fallback
let ipcData = [];
try {
  console.log('Initializing IPC data loader...');
  // Note: We load IPC data dynamically in initialize() to support async loading
  console.log('IPC data will be loaded via kaggleLoader');
} catch (error) {
  console.error('Error setting up IPC loader:', error.message);
}

// Load BNS 2023 data from data folder with error handling
let bnsData = [];
// Note: BNS data is now loaded inside initialize() to support async loading properly

/**
 * In-memory Vector Store with cosine similarity
 * Implements RAG-compatible vector search
 */
class SimpleVectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = null;
    this.initialized = false;
  }

  /**
   * Initialize the vector store with documents
   * Using IPC + BNS data from data folder only
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing vector store for RAG...');
    
    // Initialize embeddings
    this.embeddings = createEmbeddings();
    console.log('Embeddings model loaded');

    // Load BNS 2023 data dynamically
    try {
      const bnsModule = await import('../data/data.js');
      bnsData = bnsModule.default || [];
      if (!Array.isArray(bnsData)) {
        console.warn('BNS data is not an array, using empty array');
        bnsData = [];
      }
      console.log('Loaded ' + bnsData.length + ' BNS 2023 sections');
    } catch (error) {
      console.error('Error loading BNS data:', error.message);
      bnsData = [];
    }

    // Load IPC data from Kaggle/HuggingFace with fallback to local
    try {
      ipcData = await loadIPCDataset();
      console.log('Loaded ' + ipcData.length + ' IPC sections from Kaggle/HuggingFace');
    } catch (error) {
      console.error('Error loading IPC data from Kaggle:', error.message);
      // Fallback: try loading from local file
      try {
        const ipcDataPath = join(__dirname, '../data/ipc_dataset.json');
        const rawData = readFileSync(ipcDataPath, 'utf-8');
        ipcData = JSON.parse(rawData);
        console.log('Loaded ' + ipcData.length + ' IPC sections from local file');
      } catch (localError) {
        console.error('Error loading local IPC data:', localError.message);
        ipcData = [];
      }
    }

    // Prepare documents from IPC data
    const ipcDocs = ipcData
      .filter(item => item && item.section && item.content)
      .map((item) => ({
        pageContent: (item.title || '') + ': ' + item.content,
        metadata: {
          section: item.section,
          title: item.title || '',
          source: 'IPC',
          isStatute: true
        },
      }));

    // Prepare documents from BNS 2023 data
    const bnsDocs = bnsData
      .filter(item => item && item.section && item.content)
      .map((item) => ({
        pageContent: (item.title || '') + ': ' + item.content,
        metadata: {
          section: item.section,
          title: item.title || '',
          source: 'BNS 2023',
          isStatute: true
        },
      }));

    // Load IPC PDF data (PRIMARY SOURCE - only use PDF for responses)
    let pdfDocs = [];
    try {
      const pdfDocuments = await loadAllPDFDocuments();
      console.log('Loaded ' + pdfDocuments.length + ' documents from IPC_DataPDF.pdf');
      
      // Process PDF documents
      pdfDocs = pdfDocuments
        .filter(doc => doc && doc.pageContent)
        .map((doc) => ({
          pageContent: doc.pageContent,
          metadata: {
            section: doc.metadata?.caseNumber || 'Unknown',
            title: doc.metadata?.fileName || '',
            source: 'IPC PDF',
            isStatute: false
          },
        }));
    } catch (pdfError) {
      console.error('Error loading PDF data:', pdfError.message);
      pdfDocs = [];
    }

    // Use BOTH IPC JSON data and PDF data for comprehensive responses
    const allDocs = [...ipcDocs, ...bnsDocs, ...pdfDocs];
    console.log('Total documents to embed: ' + allDocs.length);
    console.log('  - IPC sections: ' + ipcDocs.length);
    console.log('  - BNS sections: ' + bnsDocs.length);
    console.log('  - PDF documents: ' + pdfDocs.length);

    if (allDocs.length === 0) {
      console.warn('No documents to embed! Please check your data files.');
      this.initialized = true;
      return;
    }

    // Generate embeddings for all documents
    console.log('Generating embeddings for RAG...');
    const texts = allDocs.map(doc => doc.pageContent);
    
    try {
      const vectors = await this.embeddings.embedDocuments(texts);

      // Store documents with their vectors
      this.documents = allDocs.map((doc, index) => ({
        ...doc,
        vector: vectors[index],
      }));

      this.initialized = true;
      console.log('Vector store initialized with ' + this.documents.length + ' documents');
    } catch (error) {
      console.error('Error generating embeddings:', error.message);
      // Use fallback: store documents without embeddings
      this.documents = allDocs.map((doc) => ({
        ...doc,
        vector: new Array(100).fill(0),
      }));
      this.initialized = true;
      console.log('Vector store initialized with fallback embeddings');
    }
  }

  /**
   * Perform similarity search with scores
   * Core RAG operation: find relevant documents
   */
  async similaritySearchWithScore(query, k = 3) {
    await this.initialize();

    if (this.documents.length === 0) {
      console.warn('No documents in vector store for search');
      return [];
    }

    // Get query embedding
    const queryVector = await this.embeddings.embedQuery(query);

    // Calculate cosine similarity for each document
    const results = this.documents.map((doc) => {
      const similarity = this.cosineSimilarity(queryVector, doc.vector);
      return [doc, 1 - similarity]; // Convert to distance (lower is better)
    });

    // Sort by similarity (lower distance = higher similarity)
    results.sort((a, b) => a[1] - b[1]);

    // Return top k results
    return results.slice(0, k);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) {
      return 0;
    }
    
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  /**
   * Get all documents (for debugging)
   */
  getAllDocuments() {
    return this.documents;
  }
}

// Singleton instance
let vectorStoreInstance = null;

/**
 * Initialize and get vector store instance
 */
export const initializeVectorStore = async () => {
  const store = new SimpleVectorStore();
  await store.initialize();
  return store;
};

/**
 * Get the singleton vector store instance
 */
export const getVectorStore = async () => {
  if (!vectorStoreInstance) {
    vectorStoreInstance = await initializeVectorStore();
  }
  return vectorStoreInstance;
};

/**
 * Reset the vector store (for testing)
 */
export const resetVectorStore = async () => {
  vectorStoreInstance = null;
  return await getVectorStore();
};

/**
 * Perform similarity search
 * This is the core RAG retrieval function
 */
export const similaritySearch = async (query, k = 3) => {
  try {
    const store = await getVectorStore();
    const results = await store.similaritySearchWithScore(query, k);
    return results;
  } catch (error) {
    console.error('Error in similarity search:', error);
    throw error;
  }
};

export default {
  initializeVectorStore,
  getVectorStore,
  resetVectorStore,
  similaritySearch,
};

