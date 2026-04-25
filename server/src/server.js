import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import externalBooksRoutes from './routes/external-books.js';
import { initAutomation } from './services/automationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login/register attempts from this IP, please try again after 15 minutes'
});

// JSON Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/books', apiLimiter, bookRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/external-books', apiLimiter, externalBooksRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Validate JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret' || process.env.JWT_SECRET === 'your_super_secret_jwt_key_here_make_it_long_and_random') {
  console.error("FATAL ERROR: JWT_SECRET is not defined or is set to a placeholder.");
  console.error("Please configure a secure JWT_SECRET in server/.env");
  process.exit(1);
}

// MongoDB connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookverse';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function connectWithRetry(attempt = 1) {
  try {
    console.log(`🔌 MongoDB connection attempt ${attempt}/${MAX_RETRIES}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    if (MONGODB_URI.includes('mongodb.net')) {
      console.log('✅ Connected to MongoDB Atlas (online)');
    } else {
      console.log('✅ Connected to Local MongoDB');
    }
    return true;
  } catch (err) {
    console.error(`❌ Attempt ${attempt}/${MAX_RETRIES} failed:`, err.message);
    
    if (attempt < MAX_RETRIES) {
      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectWithRetry(attempt + 1);
    }
    return false;
  }
}

// Start the server - even if DB connection fails, server stays up for health checks
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  const connected = await connectWithRetry();
  
  if (connected) {
    // Start the book automation service only if DB is connected
    initAutomation();
    console.log('✅ All systems operational');
  } else {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('⚠️  WARNING: Server running WITHOUT database connection');
    console.error('   API requests requiring the database will fail.');
    console.error('');
    console.error('   To fix this, update MONGODB_URI in server/.env with');
    console.error('   a valid MongoDB connection string. You can get one');
    console.error('   free at: https://cloud.mongodb.com');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
  }
});

// Handle MongoDB reconnection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

export default app;
