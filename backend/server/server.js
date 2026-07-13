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
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRoutes, { setupSocketHandlers } from './routes/chat.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import lawsRoutes from './routes/laws.js';
import { User } from './data/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Always load backend/.env regardless of the command's current working directory
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const httpServer = createServer(app);

// CORS configuration - support multiple origins
const defaultAllowed = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || defaultAllowed.join(','))
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Socket.io setup with CORS - support multiple origins
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io',
});

// Socket.IO Engine error handling for better debugging
io.engine.on("connection_error", (err) => {
  console.error('🔴 Socket.IO Engine Error:', {
    code: err.code,
    message: err.message,
    context: err.context
  });
});

// Socket.IO connection middleware
io.use((socket, next) => {
  try {
    // Allow connections without immediate auth - we'll verify token in handlers
    next();
  } catch (err) {
    console.error('Socket.IO middleware error:', err);
    next(new Error('Authentication error'));
  }
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

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    const reqOrigin = origin || '';
    if (!reqOrigin) return callback(null, true);

    if (allowedOrigins.includes(reqOrigin)) return callback(null, reqOrigin);

    // Allow same-origin / direct requests.
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}));

// Handle preflight with the same CORS settings as normal requests.
// This prevents browsers from blocking OPTIONS calls.
app.options('*', cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
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
app.use('/api/laws', lawsRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI LegalGPT Assistant (Gemini)',
    socketIO: 'enabled'
  });
});

// Setup WebSocket handlers
setupSocketHandlers(io);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`❌ Backend Error: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Initialize application - start server even without MongoDB
const initializeApp = async () => {
  let dbConnected = false;
  
  // MongoDB connection - don't block server startup
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/alphalegalgpt';
    
    const isValidMongoUri = mongoUri.startsWith('mongodb://') || 
                            mongoUri.startsWith('mongodb+srv://') || 
                            mongoUri.startsWith('mongodb+');
    
    if (!isValidMongoUri || mongoUri.length < 10) {
      console.error(`⚠️ Invalid MONGODB_URI: "${mongoUri}" - running without database`);
    } else {
      try {
        await mongoose.connect(mongoUri);
        dbConnected = true;
        console.log('✅ Connected to MongoDB');
      } catch (error) {
        console.error('⚠️ MongoDB Connection Failed (continuing without DB):', error.message);
      }
    }
  } catch (dbError) {
    console.error('⚠️ Database init error (continuing without DB):', dbError.message);
  }

  // Seed default admin user if exists and DB connected
  if (dbConnected) {
    try {
      const defaultEmail = 'admin@alphalegal.com';
      const existingAdmin = await User.findOne({ email: defaultEmail });
      if (!existingAdmin) {
        const bcrypt = (await import('bcryptjs')).default;
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
          email: defaultEmail,
          name: 'Admin User',
          password: hashedPassword,
          isVerified: true
        });
        console.log('✅ Default admin user created: admin@alphalegal.com / password123');
      } else {
        console.log('✅ Default user already exists');
      }
    } catch (seedError) {
      console.error('⚠️ User seed error:', seedError.message);
    }
  }

  // Start server regardless of DB status
  console.log('Starting AI LegalGPT Backend (Gemini)...');
  console.log(`Database: ${dbConnected ? 'MongoDB' : 'Unavailable (using local search only)'}`);

  const PORT = process.env.PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║           AI LegalGPT Backend Running             ║
╠═══════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                    ║
║  API:     http://localhost:${PORT}/api               ║
║  Frontend: ${process.env.FRONTEND_URL}                ║
║  LLM:     Gemini                                  ║
║  WebSocket: Enabled                               ║
║  Database: ${dbConnected ? 'MongoDB' : 'Unavailable'}       ║
╚═══════════════════════════════════════════════════╝
      `);
  });
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