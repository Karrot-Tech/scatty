import { create } from 'zustand';
import { ScattyState, Message, EmotionData, DEFAULT_EMOTION, generateSessionId, generateMessageId } from '@scatty/shared';
import Constants from 'expo-constants';

interface ScattyStore {
  // Connection
  serverUrl: string;
  connected: boolean;
  sessionId: string;

  // State
  state: ScattyState;
  currentEmotion: EmotionData;

  // Settings
  selectedVoice: string | null;

  // Conversation
  messages: Message[];
  currentResponse: string;
  liveTranscript: string;

  // Actions
  setServerUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
  setState: (state: ScattyState) => void;
  setEmotion: (emotion: EmotionData) => void;
  setSelectedVoice: (voice: string | null) => void;
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
  serverUrl: (Constants.expoConfig?.extra?.serverUrl as string) || 'https://scatty-production.up.railway.app',
  connected: false,
  sessionId: generateSessionId(),
  state: 'idle',
  currentEmotion: DEFAULT_EMOTION,
  selectedVoice: null,
  messages: [],
  currentResponse: '',
  liveTranscript: '',

  // Actions
  setServerUrl: (url) => set({ serverUrl: url }),

  setConnected: (connected) => set({ connected }),

  setState: (state) => set({ state }),

  setEmotion: (emotion) => set({ currentEmotion: emotion }),

  setSelectedVoice: (voice) => set({ selectedVoice: voice }),

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
