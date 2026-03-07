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

console.log(`Loaded ${ipcData.length} IPC sections`);
console.log(`Loaded ${bnsData.length} BNS 2023 sections`);

import { createEmbeddings } from './embeddings.js';

// In-memory vector store
class SimpleVectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = createEmbeddings();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing in-memory vector store...');
    
    // Prepare documents from IPC data
    const ipcDocs = ipcData.map((item) => ({
      pageContent: `${item.title}: ${item.content}`,
      metadata: {
        section: item.section,
        title: item.title,
        source: 'IPC',
      },
    }));
    
    // Prepare documents from BNS 2023 data
    const bnsDocs = bnsData.map((item) => ({
      pageContent: `${item.title}: ${item.content}`,
      metadata: {
        section: item.section,
        title: item.title,
        source: 'BNS 2023',
      },
    }));
    
    // Combine all documents
    const allDocs = [...ipcDocs, ...bnsDocs];
    
    // Create embeddings for all documents
    const texts = allDocs.map(doc => doc.pageContent);
    const vectors = await this.embeddings.embedDocuments(texts);
    
    // Store documents with their vectors
    this.documents = allDocs.map((doc, index) => ({
      ...doc,
      vector: vectors[index],
    }));
    
    this.initialized = true;
    console.log(`Vector store initialized with ${this.documents.length} documents (${ipcDocs.length} IPC + ${bnsDocs.length} BNS 2023)`);
  }

  async similaritySearchWithScore(query, k = 3) {
    await this.initialize();
    
    // Get query embedding
    const queryVector = await this.embeddings.embedQuery(query);
    
    // Calculate cosine similarity for each document
    const results = this.documents.map(doc => {
      const similarity = this.cosineSimilarity(queryVector, doc.vector);
      return [doc, 1 - similarity]; // Convert to distance (lower is better)
    });
    
    // Sort by similarity (lower distance = higher similarity)
    results.sort((a, b) => a[1] - b[1]);
    
    // Return top k results
    return results.slice(0, k);
  }

  cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }
}

// Singleton instance
let vectorStoreInstance = null;

export const initializeVectorStore = async () => {
  const store = new SimpleVectorStore();
  await store.initialize();
  return store;
};

export const getVectorStore = async () => {
  if (!vectorStoreInstance) {
    vectorStoreInstance = await initializeVectorStore();
  }
  return vectorStoreInstance;
};

export const resetVectorStore = async () => {
  vectorStoreInstance = null;
  return await getVectorStore();
};

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

