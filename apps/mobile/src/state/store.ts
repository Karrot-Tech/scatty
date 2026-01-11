import { create } from 'zustand';
import { ScattyState, Message, generateSessionId, generateMessageId } from '@scatty/shared';

interface ScattyStore {
  // Connection
  serverUrl: string;
  connected: boolean;
  sessionId: string;

  // State
  state: ScattyState;

  // Conversation
  messages: Message[];
  currentResponse: string;
  liveTranscript: string;

  // Actions
  setServerUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
  setState: (state: ScattyState) => void;
  setLiveTranscript: (transcript: string) => void;
  setCurrentResponse: (response: string) => void;
  appendCurrentResponse: (chunk: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string, hasImage?: boolean) => void;
  finalizeResponse: () => void;
  resetSession: () => void;
}

export const useScattyStore = create<ScattyStore>((set, get) => ({
  // Initial state
  // Use 10.0.2.2 for Android emulator, localhost for iOS simulator
  // For physical devices, change this in Settings
  serverUrl: 'http://192.168.1.117:3001',
  connected: false,
  sessionId: generateSessionId(),
  state: 'idle',
  messages: [],
  currentResponse: '',
  liveTranscript: '',

  // Actions
  setServerUrl: (url) => set({ serverUrl: url }),

  setConnected: (connected) => set({ connected }),

  setState: (state) => set({ state }),

  setLiveTranscript: (transcript) => set({ liveTranscript: transcript }),

  setCurrentResponse: (response) => set({ currentResponse: response }),

  appendCurrentResponse: (chunk) => set((state) => ({
    currentResponse: state.currentResponse + chunk,
  })),

  addMessage: (role, content, hasImage) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: generateMessageId(),
        role,
        content,
        timestamp: Date.now(),
        hasImage,
      },
    ],
  })),

  finalizeResponse: () => {
    const { currentResponse } = get();
    if (currentResponse) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: generateMessageId(),
            role: 'assistant',
            content: currentResponse,
            timestamp: Date.now(),
          },
        ],
        currentResponse: '',
      }));
    }
  },

  resetSession: () => set({
    sessionId: generateSessionId(),
    messages: [],
    currentResponse: '',
    liveTranscript: '',
    state: 'idle',
  }),
}));
