import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

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
      const available = await Voice.isAvailable();
      console.log('[VoiceService] Voice.isAvailable() returned:', available);
      this.isAvailableFlag = !!available;

      if (this.isAvailableFlag) {
        console.log('[VoiceService] Setting up voice callbacks');
        Voice.onSpeechStart = this.handleSpeechStart;
        Voice.onSpeechEnd = this.handleSpeechEnd;
        Voice.onSpeechResults = this.handleSpeechResults;
        Voice.onSpeechPartialResults = this.handlePartialResults;
        Voice.onSpeechError = this.handleSpeechError;
      } else {
        console.log('[VoiceService] Voice not available');
      }
    } catch (e) {
      console.log('[VoiceService] Voice check failed:', e);
      this.isAvailableFlag = false;
    }

    this.isInitialized = true;
    console.log('[VoiceService] Initialized, available:', this.isAvailableFlag);
  }

  setCallbacks(callbacks: VoiceCallback): void {
    this.callbacks = callbacks;
  }

  private async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS handles permissions differently
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Scatty needs access to your microphone for voice input.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      console.log('[VoiceService] Microphone permission:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('[VoiceService] Permission request error:', err);
      return false;
    }
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

    // Request microphone permission
    const hasPermission = await this.requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert(
        'Microphone Permission Required',
        'Please grant microphone permission to use voice input.',
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
      this.isAvailableFlag = !!(await Voice.isAvailable());
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
    const errorCode = e.error?.code;
    const errorMessage = e.error?.message ?? 'Speech recognition error';

    // Normalize code to string. Code 7 = ERROR_NO_MATCH (no speech detected) - not a real error
    const code = String(errorCode);
    if (code === '7') {
      console.log('No speech detected');
      this.callbacks.onEnd?.();
      return;
    }

    // Code 5 = ERROR_CLIENT (usually permission or audio issue)
    if (code === '5') {
      console.log('[VoiceService] Client error - may need permission');
      this.callbacks.onError?.('Microphone access error. Please check permissions.');
      return;
    }

    console.error('Speech error:', e.error);
    this.callbacks.onError?.(errorMessage);
  };
}

export const voiceService = new VoiceService();
