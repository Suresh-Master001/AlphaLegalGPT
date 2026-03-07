/**
 * PDF Loader for RAG Pipeline
 * Extracts text content from legal case PDFs in the DataSet folder
 * 
 * This module processes all PDF files from:
 * - backend/server/DataSet/ (case judgments)
 * - backend/server/data/ (additional PDFs)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Dynamic import for pdf-parse (CommonJS module)
let pdfParse;
async function loadPdfParse() {
  if (!pdfParse) {
    const pdfParseLib = await import('pdf-parse');
    pdfParse = pdfParseLib.default;
  }
  return pdfParse;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extract text content from a single PDF file
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Object} - Extracted text and metadata
 */
async function extractTextFromPDF(pdfPath) {
  try {
    const pdfParser = await loadPdfParse();
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParser(dataBuffer);
    
    // Extract filename as case identifier
    const fileName = path.basename(pdfPath, '.pdf');
    
    // Parse case number from filename (e.g., "197830" -> "1978/30")
    let caseNumber = fileName;
    let year = null;
    
    // Try to extract year and case number from filename
    const yearMatch = fileName.match(/^(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
      const remaining = fileName.substring(yearMatch[0].length);
      const numMatch = remaining.match(/\d+/);
      caseNumber = numMatch ? `${year}/${numMatch[0]}` : fileName;
    }
    
    // Clean and truncate text if too long (for embedding purposes)
    let text = data.text || '';
    
    // Extract first 5000 characters as main content for embedding
    // (PDF full text can be very long)
    const maxLength = 5000;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return {
      success: true,
      fileName,
      caseNumber,
      year,
      pageCount: data.numpages,
      text: text.trim(),
      fullText: data.text
    };
    
  } catch (error) {
    console.error(`Error extracting text from ${pdfPath}:`, error.message);
    return {
      success: false,
      fileName: path.basename(pdfPath),
      error: error.message
    };
  }
}

/**
 * Process all PDFs from a directory
 * @param {string} dirPath - Directory containing PDF files
 * @returns {Array} - Array of processed document objects
 */
async function processPDFDirectory(dirPath) {
  const documents = [];
  
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory not found: ${dirPath}`);
      return documents;
    }
    
    const files = fs.readdirSync(dirPath);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    console.log(`Found ${pdfFiles.length} PDF files in ${dirPath}`);
    
    for (const file of pdfFiles) {
      const pdfPath = path.join(dirPath, file);
      const result = await extractTextFromPDF(pdfPath);
      
      if (result.success) {
        documents.push({
          pageContent: `Case: ${result.caseNumber}\n\nContent: ${result.text}`,
          metadata: {
            caseNumber: result.caseNumber,
            fileName: result.fileName,
            year: result.year,
            pageCount: result.pageCount,
            source: 'PDF Case Judgment',
            fullText: result.fullText
          }
        });
        console.log(`Processed: ${result.caseNumber}`);
      } else {
        console.warn(`Failed to process: ${file} - ${result.error}`);
      }
    }
    
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
  }
  
  return documents;
}

/**
 * Load all PDFs from DataSet and data folders
 * @returns {Array} - Combined array of all PDF documents
 */
export async function loadAllPDFDocuments() {
  console.log('Loading PDF documents...');
  
  const datasetPath = path.join(__dirname, '../DataSet');
  const dataPath = path.join(__dirname, '../data');
  
  const [datasetDocs, dataDocs] = await Promise.all([
    processPDFDirectory(datasetPath),
    processPDFDirectory(dataPath)
  ]);
  
  const allDocs = [...datasetDocs, ...dataDocs];
  console.log(`Total PDF documents loaded: ${allDocs.length}`);
  
  return allDocs;
}

/**
 * Get a specific PDF document by case number
 * @param {string} caseNumber - Case number to search for
 * @returns {Object|null} - Document if found
 */
export async function getPDFByCaseNumber(caseNumber) {
  const allDocs = await loadAllPDFDocuments();
  return allDocs.find(doc => doc.metadata.caseNumber === caseNumber) || null;
}

/**
 * Search PDFs by keyword in content
 * @param {string} keyword - Keyword to search for
 * @returns {Array} - Matching documents
 */
export async function searchPDFs(keyword) {
  const allDocs = await loadAllPDFDocuments();
  const keywordLower = keyword.toLowerCase();
  
  return allDocs.filter(doc => 
    doc.pageContent.toLowerCase().includes(keywordLower) ||
    doc.metadata.caseNumber.toLowerCase().includes(keywordLower)
  );
}

export default {
  loadAllPDFDocuments,
  getPDFByCaseNumber,
  searchPDFs,
  extractTextFromPDF
};

