import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRoutes, { setupSocketHandlers } from './routes/chat.js';
import { getVectorStore } from './rag/vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Always load backend/.env regardless of the command's current working directory
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AttorneyGPT Legal Assistant (Gemini)'
  });
});

// Serve static frontend files in production
const frontendDistPath = join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(frontendDistPath, 'index.html'));
  }
});

// Setup WebSocket handlers
setupSocketHandlers(io);

// Initialize vector store on startup
const initializeApp = async () => {
  try {
    console.log('Starting AttorneyGPT Backend (Gemini)...');
    console.log('Initializing vector store with IPC dataset...');
    
    // Initialize vector store (this may take a moment)
    await getVectorStore();
    
    console.log('Vector store ready!');
    
    // Start server
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║           AttorneyGPT Backend Running             ║
╠═══════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                 ║
║  API:     http://localhost:${PORT}/api            ║
║  LLM:     Gemini                                  ║
║  WebSocket: Enabled                               ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the application
initializeApp();

export default app;
