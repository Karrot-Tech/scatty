// Web-specific TTS using Web Speech Synthesis API with better voice selection

type OnCompleteCallback = () => void;

export interface VoiceInfo {
    name: string;
    lang: string;
    isLocal: boolean;
}

class WebTTSService {
    private isSpeaking = false;
    private utterance: SpeechSynthesisUtterance | null = null;
    private selectedVoiceName: string | null = null;
    private preferredVoices: string[] = [
        // Premium/natural voices (Chrome, Edge)
        'Shelley (English (United States)) (en-US)',
        'Google UK English Female',
        'Google UK English Male',
        'Google US English',
        'Microsoft Zira - English (United States)',
        'Microsoft David - English (United States)',
        'Samantha', // macOS
        'Karen',    // macOS
        'Daniel',   // macOS UK
        // Fallback voices
        'English United States',
        'en-US',
        'en-GB',
    ];

    private getVoices(): SpeechSynthesisVoice[] {
        return window.speechSynthesis?.getVoices() || [];
    }

    setVoice(voiceName: string | null): void {
        this.selectedVoiceName = voiceName;
        console.log('[WebTTS] Voice set to:', voiceName);
    }

    getAvailableVoices(): VoiceInfo[] {
        const voices = this.getVoices();
        return voices
            .filter(v => v.lang.startsWith('en'))
            .map(v => ({
                name: v.name,
                lang: v.lang,
                isLocal: v.localService,
            }));
    }

    private selectBestVoice(): SpeechSynthesisVoice | null {
        const voices = this.getVoices();

        // If a specific voice is selected, use it
        if (this.selectedVoiceName) {
            const selectedVoice = voices.find(v => v.name === this.selectedVoiceName);
            if (selectedVoice) {
                console.log('[WebTTS] Using selected voice:', selectedVoice.name);
                return selectedVoice;
            }
        }

        // Try to find a preferred voice
        for (const preferredName of this.preferredVoices) {
            const match = voices.find(v =>
                v.name.toLowerCase().includes(preferredName.toLowerCase()) ||
                v.lang.toLowerCase().includes(preferredName.toLowerCase())
            );
            if (match) {
                console.log('[WebTTS] Selected voice:', match.name);
                return match;
            }
        }

        // Fall back to first English voice
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
            console.log('[WebTTS] Fallback to English voice:', englishVoice.name);
            return englishVoice;
        }

        // Last resort: first available voice
        if (voices.length > 0) {
            console.log('[WebTTS] Using first available voice:', voices[0].name);
            return voices[0];
        }

        return null;
    }

    async speak(text: string, onComplete?: OnCompleteCallback): Promise<void> {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.error('[WebTTS] Speech synthesis not available');
            onComplete?.();
            return;
        }

        if (this.isSpeaking) {
            await this.stop();
        }

        return new Promise((resolve) => {
            this.isSpeaking = true;
            this.utterance = new SpeechSynthesisUtterance(text);

            // Try to get the best voice
            const voice = this.selectBestVoice();
            if (voice) {
                this.utterance.voice = voice;
                console.log('[WebTTS] 🎤 Speaking with voice:', voice.name, `(${voice.lang})`);
            } else {
                console.log('[WebTTS] ⚠️ No voice selected, using browser default');
            }

            // Configure for natural speech
            this.utterance.lang = 'en-US';
            this.utterance.pitch = 1.0;
            this.utterance.rate = 0.95; // Slightly slower for clarity
            this.utterance.volume = 1.0;

            this.utterance.onend = () => {
                console.log('[WebTTS] Speech ended');
                this.isSpeaking = false;
                onComplete?.();
                resolve();
            };

            this.utterance.onerror = (event) => {
                console.error('[WebTTS] Speech error:', event.error);
                this.isSpeaking = false;
                onComplete?.();
                resolve();
            };

            // Workaround for Chrome bug: voices may not be loaded yet
            if (this.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    const voice = this.selectBestVoice();
                    if (voice && this.utterance) {
                        this.utterance.voice = voice;
                    }
                    window.speechSynthesis.speak(this.utterance!);
                };
            } else {
                window.speechSynthesis.speak(this.utterance);
            }
        });
    }

    async stop(): Promise<void> {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
        }
    }

    get speaking(): boolean {
        return this.isSpeaking;
    }

    // List all available voices (useful for debugging)
    listVoices(): void {
        const voices = this.getVoices();
        console.log('[WebTTS] All available voices:');
        voices.forEach((voice, i) => {
            console.log(`  ${i + 1}. ${voice.name} (${voice.lang}) ${voice.localService ? '[local]' : '[remote]'}`);
        });
    }
}

export const ttsService = new WebTTSService();
