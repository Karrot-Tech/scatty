import { Server, Socket } from 'socket.io';
import {
  TranscriptPayload,
  VisionPayload,
  SessionPayload,
  ScattyState,
} from '@scatty/shared';
import { sessionManager } from '../services/SessionManager';
import { aiService } from '../services/AIService';

function emitState(socket: Socket, state: ScattyState, sessionId: string): void {
  socket.emit('state:update', { state, sessionId });
}

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Session management
    socket.on('session:start', (payload: SessionPayload) => {
      const { sessionId } = payload;
      sessionManager.getOrCreate(sessionId);
      socket.emit('session:started', { sessionId });
      emitState(socket, 'idle', sessionId);
      console.log(`Session started: ${sessionId}`);
    });

    socket.on('session:end', (payload: SessionPayload) => {
      sessionManager.delete(payload.sessionId);
      console.log(`Session ended: ${payload.sessionId}`);
    });

    // Handle text transcript (voice input)
    socket.on('transcript', async (payload: TranscriptPayload) => {
      console.log('Received transcript event:', payload);
      const { text, sessionId, isFinal } = payload;

      if (!isFinal) {
        console.log('Ignoring non-final transcript');
        return;
      }

      console.log(`Processing transcript [${sessionId}]: ${text}`);
      emitState(socket, 'thinking', sessionId);

      try {
        const history = sessionManager.getHistory(sessionId);
        sessionManager.addMessage(sessionId, 'user', text);

        let fullResponse = '';

        // Stream response
        emitState(socket, 'speaking', sessionId);
        for await (const chunk of aiService.streamResponse(history, text)) {
          fullResponse += chunk;
          socket.emit('response:chunk', { text: chunk, sessionId });
        }

        // Save assistant response
        sessionManager.addMessage(sessionId, 'assistant', fullResponse);
        socket.emit('response:complete', { fullText: fullResponse, sessionId });
        emitState(socket, 'idle', sessionId);

      } catch (error: any) {
        console.error('Error processing transcript:', error?.message || error);
        console.error('Full error:', JSON.stringify(error, null, 2));
        socket.emit('error', {
          message: error?.message || 'Failed to process your message',
          sessionId,
        });
        emitState(socket, 'idle', sessionId);
      }
    });

    // Handle vision request (camera input)
    socket.on('vision', async (payload: VisionPayload) => {
      const { text, frame, sessionId } = payload;

      console.log(`Vision request [${sessionId}]: ${text}`);
      emitState(socket, 'looking', sessionId);

      try {
        const history = sessionManager.getHistory(sessionId);
        sessionManager.addMessage(sessionId, 'user', text, true);

        let fullResponse = '';

        // Process with vision
        emitState(socket, 'thinking', sessionId);
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX

        emitState(socket, 'speaking', sessionId);
        for await (const chunk of aiService.streamResponse(history, text, frame)) {
          fullResponse += chunk;
          socket.emit('response:chunk', { text: chunk, sessionId });
        }

        sessionManager.addMessage(sessionId, 'assistant', fullResponse);
        socket.emit('response:complete', { fullText: fullResponse, sessionId });
        emitState(socket, 'idle', sessionId);

      } catch (error) {
        console.error('Error processing vision:', error);
        socket.emit('error', {
          message: 'Failed to process image',
          sessionId,
        });
        emitState(socket, 'idle', sessionId);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
