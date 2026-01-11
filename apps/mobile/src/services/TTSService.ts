import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export interface VoiceInfo {
  name: string;
  lang: string;
  isLocal: boolean;
}

class TTSService {
  private isSpeaking = false;
  private selectedVoiceName: string | null = null;
  private preferredVoices: string[] = [
    'Google UK English Female',
    'Google UK English Male',
    'Google US English',
    'Microsoft Zira - English (United States)',
    'Microsoft David - English (United States)',
    'Samantha',
    'Karen',
    'Daniel',
  ];

  setVoice(voiceName: string | null): void {
    this.selectedVoiceName = voiceName;
    console.log('[TTS] Voice set to:', voiceName);
  }

  getAvailableVoices(): VoiceInfo[] {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices() || [];
      return voices
        .filter(v => v.lang.startsWith('en'))
        .map(v => ({
          name: v.name,
          lang: v.lang,
          isLocal: v.localService,
        }));
    }
    return [];
  }

  private selectWebVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices() || [];

    // If a specific voice is selected, use it
    if (this.selectedVoiceName) {
      const selectedVoice = voices.find(v => v.name === this.selectedVoiceName);
      if (selectedVoice) {
        return selectedVoice;
      }
    }

    // Try to find a preferred voice
    for (const preferredName of this.preferredVoices) {
      const match = voices.find(v =>
        v.name.toLowerCase().includes(preferredName.toLowerCase())
      );
      if (match) return match;
    }

    // Fall back to first English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  }

  async speak(text: string): Promise<void> {
    if (this.isSpeaking) {
      await this.stop();
    }

    // Use Web Speech API on web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      return this.speakWeb(text);
    }

    // Use expo-speech on native platforms
    return this.speakNative(text);
  }

  private speakWeb(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.isSpeaking = true;
      const utterance = new SpeechSynthesisUtterance(text);

      const voice = this.selectWebVoice();
      if (voice) {
        utterance.voice = voice;
        console.log('[TTS Web] 🎤 Speaking with voice:', voice.name, `(${voice.lang})`);
      } else {
        console.log('[TTS Web] ⚠️ No voice selected, using browser default');
      }

      utterance.lang = 'en-US';
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      utterance.volume = 1.0;

      utterance.onend = () => {
        console.log('[TTS Web] Speech ended');
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('[TTS Web] Speech error:', event.error);
        this.isSpeaking = false;
        resolve();
      };

      // Workaround for Chrome: voices may not be loaded yet
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const voice = this.selectWebVoice();
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        };
      } else {
        window.speechSynthesis.speak(utterance);
      }
    });
  }

  private speakNative(text: string): Promise<void> {
    console.log('[TTS Native] Speaking:', text.substring(0, 30) + '...');

    return new Promise((resolve) => {
      this.isSpeaking = true;

      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: () => {
          this.isSpeaking = false;
          resolve();
        },
        onStopped: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  async stop(): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    } else {
      await Speech.stop();
    }
    this.isSpeaking = false;
  }

  get speaking(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new TTSService();
