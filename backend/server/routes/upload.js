import express from 'express';
import multer from 'multer';
import fs from 'fs';
import pdfParse from 'pdf-parse';

const router = express.Router();

// Define multer storage for temporarily saving files to 'server/tmp'
const upload = multer({ 
  dest: 'server/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB maximum file size
});

router.post('/', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    let extractedText = '';

    if (fileExtension === 'pdf') {
       // Parse PDF file
       const dataBuffer = fs.readFileSync(filePath);
       const pdfData = await pdfParse(dataBuffer);
       extractedText = pdfData.text;
    } else if (fileExtension === 'txt') {
       // Parse plain text file
       extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
       // Delete unsupported file and return error
       fs.unlinkSync(filePath);
       return res.status(400).json({ error: 'Unsupported file type. Only .pdf and .txt are allowed.' });
    }

    // Clean up file after parsing
    fs.unlinkSync(filePath);

    res.json({
        success: true,
        filename: req.file.originalname,
        text: extractedText
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    
    // Attempt cleanup if something breaks
    if (req.file && fs.existsSync(req.file.path)) {
       fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to process document', details: error.message });
  }
});

export default router;
