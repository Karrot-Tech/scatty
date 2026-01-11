import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketHandlers } from './socket/handlers';
import { aiService } from './services/AIService';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS based on environment
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

const io = new Server(httpServer, {
  cors: {
    origin: isProduction ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: isProduction ? allowedOrigins : '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Initialize AI service
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  aiService.initialize(apiKey);
  console.log('✓ Gemini AI initialized');
} else {
  const errorMsg = '⚠ GEMINI_API_KEY not set - AI responses will fail';
  if (isProduction) {
    console.error(errorMsg);
    console.error('GEMINI_API_KEY is required in production');
    process.exit(1);
  } else {
    console.warn(errorMsg);
  }
}

// Setup Socket.io handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║         🤖 Scatty Server              ║
╠═══════════════════════════════════════╣
║  HTTP:      http://localhost:${PORT}     ║
║  WebSocket: ws://localhost:${PORT}       ║
╚═══════════════════════════════════════╝
  `);
});
