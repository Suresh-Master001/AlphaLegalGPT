
/**
 * Vector Store for RAG Pipeline
 * Implements document storage with embeddings for semantic search
 * 
 * Now includes:
 * - IPC dataset (JSON)
 * - BNS 2023 dataset (JSON)
 * - PDF Case Judgments from DataSet folder
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createEmbeddings } from './embeddings.js';
import { loadAllPDFDocuments } from './pdfLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load IPC data
const ipcDataPath = join(__dirname, '../data/ipc_dataset.json');
const ipcData = JSON.parse(readFileSync(ipcDataPath, 'utf-8'));

// Import BNS 2023 data
import bns2023Data from '../data/data.js';

const bnsData = bns2023Data || [];

console.log('Loaded ' + ipcData.length + ' IPC sections');
console.log('Loaded ' + bnsData.length + ' BNS 2023 sections');

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
   * Now includes IPC, BNS 2023, and PDF case judgments
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing vector store for RAG...');
    
    // Initialize embeddings
    this.embeddings = createEmbeddings();
    console.log('Embeddings model loaded');

    // Prepare documents from IPC data
    const ipcDocs = ipcData.map((item) => ({
      pageContent: item.title + ': ' + item.content,
      metadata: {
        section: item.section,
        title: item.title,
        source: 'IPC',
      },
    }));

    // Prepare documents from BNS 2023 data
    const bnsDocs = bnsData.map((item) => ({
      pageContent: item.title + ': ' + item.content,
      metadata: {
        section: item.section,
        title: item.title,
        source: 'BNS 2023',
      },
    }));

    // Load PDF documents from DataSet folder
    console.log('Loading PDF documents from DataSet folder...');
    const pdfDocs = await loadAllPDFDocuments();
    console.log(`Loaded ${pdfDocs.length} PDF case documents`);

    // Combine all documents (IPC + BNS + PDFs)
    const allDocs = [...ipcDocs, ...bnsDocs, ...pdfDocs];
    console.log('Total documents to embed: ' + allDocs.length);

    // Generate embeddings for all documents
    console.log('Generating embeddings for RAG...');
    const texts = allDocs.map(doc => doc.pageContent);
    const vectors = await this.embeddings.embedDocuments(texts);

    // Store documents with their vectors
    this.documents = allDocs.map((doc, index) => ({
      ...doc,
      vector: vectors[index],
    }));

    this.initialized = true;
    console.log('Vector store initialized with ' + this.documents.length + ' documents');
  }

  /**
   * Perform similarity search with scores
   * Core RAG operation: find relevant documents
   */
  async similaritySearchWithScore(query, k = 3) {
    await this.initialize();

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

