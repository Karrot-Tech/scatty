import * as Speech from 'expo-speech';

class TTSService {
  private isSpeaking = false;

  async speak(text: string): Promise<void> {
    if (this.isSpeaking) {
      await this.stop();
    }

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
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  get speaking(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new TTSService();
