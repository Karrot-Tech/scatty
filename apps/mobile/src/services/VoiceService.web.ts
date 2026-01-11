import { Platform } from 'react-native';

type VoiceCallback = {
  onStart?: () => void;
  onEnd?: () => void;
  onResults?: (transcript: string, isFinal: boolean) => void;
  onPartialResults?: (transcript: string) => void;
  onError?: (error: string) => void;
};

// Web Speech API types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

class WebVoiceService {
  private callbacks: VoiceCallback = {};
  private isInitialized = false;
  private isAvailableFlag = false;
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if Web Speech API is available
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
          console.log('[WebVoiceService] Speech recognition started');
          this.isListening = true;
          this.callbacks.onStart?.();
        };

        this.recognition.onend = () => {
          console.log('[WebVoiceService] Speech recognition ended');
          this.isListening = false;
          this.callbacks.onEnd?.();
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            console.log('[WebVoiceService] Final transcript:', finalTranscript);
            this.callbacks.onResults?.(finalTranscript, true);
          } else if (interimTranscript) {
            console.log('[WebVoiceService] Interim transcript:', interimTranscript);
            this.callbacks.onPartialResults?.(interimTranscript);
          }
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('[WebVoiceService] Error:', event.error);
          this.isListening = false;
          
          if (event.error === 'no-speech') {
            this.callbacks.onEnd?.();
            return;
          }
          
          if (event.error === 'not-allowed') {
            this.callbacks.onError?.('Microphone permission denied. Please allow microphone access.');
            return;
          }

          this.callbacks.onError?.(event.error || 'Speech recognition error');
        };

        this.isAvailableFlag = true;
        console.log('[WebVoiceService] Web Speech API available');
      } else {
        console.log('[WebVoiceService] Web Speech API not available');
        this.isAvailableFlag = false;
      }
    }

    this.isInitialized = true;
    console.log('[WebVoiceService] Initialized, available:', this.isAvailableFlag);
  }

  setCallbacks(callbacks: VoiceCallback): void {
    this.callbacks = callbacks;
  }

  async startListening(): Promise<boolean> {
    if (!this.isAvailableFlag || !this.recognition) {
      console.error('[WebVoiceService] Speech recognition not available');
      this.callbacks.onError?.('Speech recognition is not available in this browser. Try Chrome or Edge.');
      return false;
    }

    if (this.isListening) {
      console.log('[WebVoiceService] Already listening');
      return true;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('[WebVoiceService] Start error:', error);
      this.callbacks.onError?.('Failed to start speech recognition');
      return false;
    }
  }

  get voiceAvailable(): boolean {
    return this.isAvailableFlag;
  }

  async stopListening(): Promise<void> {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('[WebVoiceService] Stop error:', error);
      }
    }
  }

  async cancel(): Promise<void> {
    if (this.recognition) {
      try {
        this.recognition.abort();
        this.isListening = false;
      } catch (error) {
        console.error('[WebVoiceService] Cancel error:', error);
      }
    }
  }

  async destroy(): Promise<void> {
    await this.cancel();
    this.isInitialized = false;
  }

  async checkAvailable(): Promise<boolean> {
    return this.isAvailableFlag;
  }
}

export const voiceService = new WebVoiceService();
