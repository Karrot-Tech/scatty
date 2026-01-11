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

// Add API version header to all responses
const API_VERSION = '1.0.0';
app.use((req, res, next) => {
  res.setHeader('X-API-Version', API_VERSION);
  next();
});

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'Scatty API',
    version: API_VERSION,
    docs: 'https://docs.scatty.xyz',
    endpoints: {
      health: '/v1/health',
      websocket: 'wss://api.scatty.xyz',
    },
  });
});

// API v1 routes
const v1Router = express.Router();

// Health check endpoint
v1Router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: API_VERSION, timestamp: Date.now() });
});

app.use('/v1', v1Router);

// Legacy health check (for backwards compatibility with Railway healthcheck)
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
