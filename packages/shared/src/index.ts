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
// EMOTIONS & EXPRESSIONS
// =============================================================================

export type EmotionType =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'thinking'
  | 'surprised'
  | 'concerned'
  | 'playful'
  | 'proud'
  | 'shy';

export interface EmotionData {
  emotion: EmotionType;
  intensity: number;      // 0.0 to 1.0
  eyeSize?: number;       // 0.8 to 1.3 (squint to wide)
  mouthOpen?: number;     // 0.0 to 1.0
  wingSpeed?: number;     // 0.5 to 2.0 (slow to fast flutter)
  sparkleIntensity?: number; // 0.0 to 2.0
  blushIntensity?: number;  // 0.0 to 1.0
}

export interface ScattyResponse {
  text: string;
  emotion: EmotionData;
}

export const DEFAULT_EMOTION: EmotionData = {
  emotion: 'neutral',
  intensity: 0.5,
  eyeSize: 1.0,
  mouthOpen: 0.0,
  wingSpeed: 1.0,
  sparkleIntensity: 1.0,
  blushIntensity: 0.3,
};

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
  emotion?: EmotionData;
}

export interface ResponseCompletePayload {
  fullText: string;
  sessionId: string;
  emotion: EmotionData;
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
