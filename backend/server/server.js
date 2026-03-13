import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRoutes, { setupSocketHandlers } from './routes/chat.js';
import authRoutes from './routes/auth.js';
import { getVectorStore } from './rag/vectorStore.js';
import { User } from './models/User.js';

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
app.use(helmet());
app.use(compression());
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);
app.use(morgan('combined'));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AttorneyGPT Legal Assistant (Gemini)'
  });
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
    
    // Seed default admin user if not exists
    try {
      const defaultEmail = 'admin@alphalegal.com';
      if (!User.findByEmail(defaultEmail)) {
        await User.create({
          name: 'Admin User',
          email: defaultEmail,
          password: 'password123'
        });
        console.log('✅ Default user created: admin@alphalegal.com / password123');
      } else {
        console.log('✅ Default user already exists');
      }
    } catch (error) {
      console.error('Default user seeding error:', error);
    }
    
    console.log('Vector store ready!');
    
    // Start server
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║           AttorneyGPT Backend Running             ║
╠═══════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                    ║
║  API:     http://localhost:${PORT}/api               ║
║  Frontend: ${process.env.FRONTEND_URL}                  ║
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
