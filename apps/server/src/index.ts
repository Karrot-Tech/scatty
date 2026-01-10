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

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
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
  console.warn('⚠ GEMINI_API_KEY not set - AI responses will fail');
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
