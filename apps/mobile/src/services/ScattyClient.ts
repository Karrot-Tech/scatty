import { io, Socket } from 'socket.io-client';
import {
  TranscriptPayload,
  VisionPayload,
  ResponseChunkPayload,
  ResponseCompletePayload,
  StateUpdatePayload,
  ErrorPayload,
  SessionPayload,
} from '@scatty/shared';

type EventCallback<T> = (payload: T) => void;

class ScattyClient {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<EventCallback<any>>> = new Map();

  connect(serverUrl: string, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        this.socket.disconnect();
      }

      this.socket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('Connected to Scatty server');
        this.socket?.emit('session:start', { sessionId });
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Scatty server');
        this.emit('disconnect', {});
      });

      // Forward server events to registered handlers
      this.socket.on('response:chunk', (payload: ResponseChunkPayload) => {
        this.emit('response:chunk', payload);
      });

      this.socket.on('response:complete', (payload: ResponseCompletePayload) => {
        this.emit('response:complete', payload);
      });

      this.socket.on('state:update', (payload: StateUpdatePayload) => {
        this.emit('state:update', payload);
      });

      this.socket.on('error', (payload: ErrorPayload) => {
        this.emit('error', payload);
      });

      this.socket.on('session:started', (payload: SessionPayload) => {
        this.emit('session:started', payload);
      });
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Send transcript (voice input)
  sendTranscript(text: string, sessionId: string, isFinal: boolean = true): void {
    const payload: TranscriptPayload = { text, sessionId, isFinal };
    console.log('[ScattyClient] Sending transcript, connected:', this.socket?.connected, payload);
    if (!this.socket?.connected) {
      console.error('[ScattyClient] Cannot send - not connected!');
      return;
    }
    this.socket.emit('transcript', payload);
  }

  // Send vision request (camera + text)
  sendVision(text: string, frame: string, sessionId: string): void {
    console.log('[ScattyClient] Sending vision, connected:', this.socket?.connected, 'frame size:', frame?.length);
    if (!this.socket?.connected) {
      console.error('[ScattyClient] Cannot send vision - not connected!');
      return;
    }
    const payload: VisionPayload = { text, frame, sessionId };
    this.socket.emit('vision', payload);
  }

  // Event handling
  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(callback);
    };
  }

  private emit<T>(event: string, payload: T): void {
    this.eventHandlers.get(event)?.forEach((callback) => callback(payload));
  }
}

// Singleton instance
export const scattyClient = new ScattyClient();
