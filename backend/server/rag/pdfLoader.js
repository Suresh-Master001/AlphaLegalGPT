/**
 * PDF Loader for RAG Pipeline
 * Loads and parses PDF case judgments from DataSet folder
 */

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const datasetPath = join(__dirname, '../../DataSet');

/**
 * Load and parse a single PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Object} - Parsed document with content and metadata
 */
async function loadPDF(filePath) {
  try {
    const dataBuffer = readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    const fileName = filePath.split(/[\\/]/).pop();
    
    return {
      pageContent: data.text,
      metadata: {
        caseNumber: fileName.replace('.pdf', ''),
        fileName: fileName,
        source: 'Case Judgment',
        isStatute: false,
        year: extractYear(fileName)
      }
    };
  } catch (error) {
    console.error(`Error loading PDF ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract year from case file name
 * @param {string} fileName - PDF file name
 * @returns {number|null} - Extracted year or null
 */
function extractYear(fileName) {
  const yearMatch = fileName.match(/(19|20)\d{2}/);
  return yearMatch ? parseInt(yearMatch[0]) : null;
}

/**
 * Load all PDF documents from DataSet folder
 * @returns {Array} - Array of loaded PDF documents
 */
export async function loadAllPDFDocuments() {
  try {
    const files = readdirSync(datasetPath);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    console.log(`Found ${pdfFiles.length} PDF files in DataSet folder`);
    
    const documents = [];
    for (const pdfFile of pdfFiles) {
      const filePath = join(datasetPath, pdfFile);
      const doc = await loadPDF(filePath);
      if (doc) {
        documents.push(doc);
      }
    }
    
    return documents;
  } catch (error) {
    console.error('Error loading PDF documents:', error);
    return [];
  }
}

export default {
  loadAllPDFDocuments,
  loadPDF
};
