/**
 * @fileoverview Document upload and text extraction route
 * Supports PDF and TXT file formats with automatic cleanup
 */

import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({ 
  dest: path.join(__dirname, '../../tmp'),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and TXT files
    const allowedExtensions = ['.pdf', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and TXT files are allowed.'), false);
    }
  }
});

/**
 * Extract text from uploaded document (PDF or TXT)
 * @route POST /api/upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const extractTextFromFile = async (filePath, fileExtension) => {
  let extractedText = '';
  const fileBuffer = await fs.readFile(filePath);

  if (fileExtension === 'pdf') {
    try {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text || '';
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('PDF appears to be empty or contains no extractable text');
      }
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      throw new Error(`Failed to parse PDF: ${pdfError.message}`);
    }
  } else if (fileExtension === 'txt') {
    try {
      extractedText = fileBuffer.toString('utf8');
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('Text file is empty');
      }
    } catch (txtError) {
      console.error('Text file reading error:', txtError);
      throw new Error(`Failed to read text file: ${txtError.message}`);
    }
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }

  return extractedText;
};

/**
 * Clean up temporary file
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<void>}
 */
const cleanupTempFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log(`✅ Temp file cleaned up: ${filePath}`);
  } catch (cleanupError) {
    console.error(`⚠️ Failed to cleanup temp file ${filePath}:`, cleanupError.message);
  }
};

/**
 * Upload and process document
 * @route POST /api/upload
 */
router.post('/', upload.single('document'), async (req, res) => {
  try {
    // Validate file presence
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded',
        type: 'validation_error'
      });
    }

    const { 
      originalname: fileName, 
      path: tempFilePath, 
      size: fileSize 
    } = req.file;

    const fileExtension = path.extname(fileName).toLowerCase();
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    console.log(`📄 Processing upload: ${fileName} (${fileSizeMB} MB)`);

    // Validate file size
    if (fileSize > 10 * 1024 * 1024) {
      await cleanupTempFile(tempFilePath);
      return res.status(400).json({ 
        success: false,
        error: 'File size exceeds 10MB limit',
        type: 'file_too_large',
        maxSize: '10MB'
      });
    }

    // Extract text from file
    let extractedText;
    try {
      extractedText = await extractTextFromFile(tempFilePath, fileExtension);
    } catch (extractionError) {
      await cleanupTempFile(tempFilePath);
      return res.status(400).json({ 
        success: false,
        error: extractionError.message,
        type: 'extraction_error'
      });
    }

    // Clean up temp file
    await cleanupTempFile(tempFilePath);

    // Return success response
    const textLength = extractedText.length;
    console.log(`✅ Successfully extracted ${textLength} characters from ${fileName}`);

    res.json({
      success: true,
      filename: fileName,
      fileSize: fileSizeMB,
      textLength: textLength,
      text: extractedText,
      type: 'document_processed'
    });

  } catch (error) {
    console.error('❌ Document upload error:', error);
    
    // Attempt cleanup if temp file exists
    if (req.file?.path) {
      await cleanupTempFile(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to process document',
      type: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Handle multer errors (file size, file type, etc.)
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 10MB limit',
        type: 'file_too_large'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Only one file allowed per upload',
        type: 'too_many_files'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: error.message,
      type: 'invalid_file_type'
    });
  }
  
  console.error('Multer error:', error);
  res.status(500).json({
    success: false,
    error: 'File upload failed',
    type: 'upload_error'
  });
});

export default router;
