// Scatty Protocol Types

// =============================================================================
// STATES
// =============================================================================

export type ScattyState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'looking';

export interface ScattyStatus {
  state: ScattyState;
  sessionId: string;
  connected: boolean;
}

// =============================================================================
// CLIENT -> SERVER EVENTS
// =============================================================================

export interface TranscriptPayload {
  text: string;
  isFinal: boolean;
  sessionId: string;
}

export interface VisionPayload {
  text: string;
  frame: string; // base64 encoded image
  sessionId: string;
}

export interface SessionPayload {
  sessionId: string;
}

// Client events
export interface ClientEvents {
  'transcript': (payload: TranscriptPayload) => void;
  'vision': (payload: VisionPayload) => void;
  'session:start': (payload: SessionPayload) => void;
  'session:end': (payload: SessionPayload) => void;
}

// =============================================================================
// SERVER -> CLIENT EVENTS
// =============================================================================

export interface ResponseChunkPayload {
  text: string;
  sessionId: string;
}

export interface ResponseCompletePayload {
  fullText: string;
  sessionId: string;
}

export interface StateUpdatePayload {
  state: ScattyState;
  sessionId: string;
}

export interface ErrorPayload {
  message: string;
  code?: string;
  sessionId: string;
}

// Server events
export interface ServerEvents {
  'response:chunk': (payload: ResponseChunkPayload) => void;
  'response:complete': (payload: ResponseCompletePayload) => void;
  'state:update': (payload: StateUpdatePayload) => void;
  'error': (payload: ErrorPayload) => void;
  'session:started': (payload: SessionPayload) => void;
}

// =============================================================================
// MESSAGES (for conversation history)
// =============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  hasImage?: boolean;
}

// =============================================================================
// VISION TRIGGERS
// =============================================================================

export const VISION_TRIGGERS = [
  'look at',
  'what do you see',
  'what is this',
  'what\'s this',
  'can you see',
  'show you',
  'take a look',
  'read this',
  'what am i',
  'looking at',
];

export function detectVisionIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return VISION_TRIGGERS.some(trigger => lower.includes(trigger));
}

// =============================================================================
// UTILS
// =============================================================================

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
