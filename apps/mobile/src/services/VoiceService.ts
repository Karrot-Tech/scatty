import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import { Alert, Platform } from 'react-native';

type VoiceCallback = {
  onStart?: () => void;
  onEnd?: () => void;
  onResults?: (transcript: string, isFinal: boolean) => void;
  onPartialResults?: (transcript: string) => void;
  onError?: (error: string) => void;
};

class VoiceService {
  private callbacks: VoiceCallback = {};
  private isInitialized = false;
  private isAvailableFlag = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if Voice module is available (requires dev build)
      this.isAvailableFlag = await Voice.isAvailable() ?? false;

      if (this.isAvailableFlag) {
        Voice.onSpeechStart = this.handleSpeechStart;
        Voice.onSpeechEnd = this.handleSpeechEnd;
        Voice.onSpeechResults = this.handleSpeechResults;
        Voice.onSpeechPartialResults = this.handlePartialResults;
        Voice.onSpeechError = this.handleSpeechError;
      }
    } catch (e) {
      console.log('Voice not available - requires development build');
      this.isAvailableFlag = false;
    }

    this.isInitialized = true;
  }

  setCallbacks(callbacks: VoiceCallback): void {
    this.callbacks = callbacks;
  }

  async startListening(): Promise<boolean> {
    if (!this.isAvailableFlag) {
      Alert.alert(
        'Voice Not Available',
        'Voice recognition requires a development build. Use the Type button instead.\n\nRun: npx expo prebuild && npx expo run:android',
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      await Voice.start('en-US');
      return true;
    } catch (error) {
      console.error('Voice start error:', error);
      this.callbacks.onError?.('Failed to start voice recognition');
      return false;
    }
  }

  get voiceAvailable(): boolean {
    return this.isAvailableFlag;
  }

  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  }

  async cancel(): Promise<void> {
    try {
      await Voice.cancel();
    } catch (error) {
      console.error('Voice cancel error:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      this.isInitialized = false;
    } catch (error) {
      console.error('Voice destroy error:', error);
    }
  }

  async checkAvailable(): Promise<boolean> {
    try {
      this.isAvailableFlag = await Voice.isAvailable() ?? false;
      return this.isAvailableFlag;
    } catch {
      this.isAvailableFlag = false;
      return false;
    }
  }

  private handleSpeechStart = (e: SpeechStartEvent): void => {
    this.callbacks.onStart?.();
  };

  private handleSpeechEnd = (e: SpeechEndEvent): void => {
    this.callbacks.onEnd?.();
  };

  private handleSpeechResults = (e: SpeechResultsEvent): void => {
    const transcript = e.value?.[0] ?? '';
    this.callbacks.onResults?.(transcript, true);
  };

  private handlePartialResults = (e: SpeechResultsEvent): void => {
    const transcript = e.value?.[0] ?? '';
    this.callbacks.onPartialResults?.(transcript);
  };

  private handleSpeechError = (e: SpeechErrorEvent): void => {
    console.error('Speech error:', e.error);
    this.callbacks.onError?.(e.error?.message ?? 'Speech recognition error');
  };
}

export const voiceService = new VoiceService();
