import { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useScattyStore } from '../state/store';
import { scattyClient } from '../services/ScattyClient';
import { voiceService } from '../services/VoiceService';
import { ttsService } from '../services/TTSService';
import { detectVisionIntent, ScattyState } from '@scatty/shared';

export function useScatty() {
  const store = useScattyStore();
  const isInitialized = useRef(false);
  const ttsInitialized = useRef(false);

  // Setup socket event listeners FIRST (before connection)
  useEffect(() => {
    console.log('[Scatty] Setting up socket listeners');

    const unsubChunk = scattyClient.on('response:chunk', (payload: any) => {
      console.log('[Scatty] Received chunk:', payload.text?.substring(0, 20));
      store.appendCurrentResponse(payload.text);
    });

    const unsubComplete = scattyClient.on('response:complete', (payload: any) => {
      console.log('[Scatty] Response complete, emotion:', payload.emotion?.emotion);

      // Set the full text since we are not using streaming chunks anymore
      if (payload.fullText) {
        store.setCurrentResponse(payload.fullText);
      }

      store.finalizeResponse();
      store.setState('idle');

      // Apply emotion from response
      if (payload.emotion) {
        console.log('[Scatty] 🎭 Emotion:', payload.emotion.emotion, 'intensity:', payload.emotion.intensity);
        store.setEmotion(payload.emotion);
      }

      ttsService.speak(payload.fullText);
    });

    const unsubState = scattyClient.on('state:update', (payload: any) => {
      console.log('[Scatty] State update:', payload.state);
      store.setState(payload.state as ScattyState);
    });

    const unsubError = scattyClient.on('error', (payload: any) => {
      console.error('[Scatty] Server error:', payload.message);
      store.setState('idle');
    });

    const unsubDisconnect = scattyClient.on('disconnect', () => {
      console.log('[Scatty] Disconnected');
      store.setConnected(false);
    });

    return () => {
      unsubChunk();
      unsubComplete();
      unsubState();
      unsubError();
      unsubDisconnect();
    };
  }, []);

  // Initialize TTS voice on iOS Safari
  useEffect(() => {
    if (Platform.OS !== 'web' || ttsInitialized.current) return;
    ttsInitialized.current = true;

    // Check if iOS Safari
    const isIOSSafari = typeof navigator !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    if (isIOSSafari) {
      console.log('[Scatty] iOS Safari detected, initializing TTS voice');

      const initVoice = () => {
        const voices = window.speechSynthesis?.getVoices() || [];
        if (voices.length > 0 && !store.selectedVoice) {
          const samantha = voices.find(v => v.name === 'Samantha');
          const voiceToUse = samantha ? 'Samantha' : voices.find(v => v.lang.startsWith('en'))?.name;
          if (voiceToUse) {
            console.log('[Scatty] Auto-selecting voice for iOS Safari:', voiceToUse);
            store.setSelectedVoice(voiceToUse);
            ttsService.setVoice(voiceToUse);
          }
        }
      };

      // Try immediately and on voices changed
      initVoice();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = initVoice;
      }
    } else if (store.selectedVoice) {
      // Sync store voice to TTS service on other platforms
      ttsService.setVoice(store.selectedVoice);
    }
  }, [store.selectedVoice]);

  // Initialize connection and voice AFTER listeners are set up
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('[Scatty] Initializing...');

    // Initialize voice service (async)
    voiceService.initialize().catch(console.error);

    // Setup voice callbacks
    voiceService.setCallbacks({
      onStart: () => {
        store.setState('listening');
        store.setLiveTranscript('');
      },
      onPartialResults: (transcript) => {
        store.setLiveTranscript(transcript);
      },
      onResults: (transcript, isFinal) => {
        if (isFinal && transcript) {
          handleFinalTranscript(transcript);
        }
      },
      onEnd: () => {
        // Reset to idle when voice recognition ends
        console.log('[Scatty] Voice recognition ended, resetting to idle');
        store.setState('idle');
        store.setLiveTranscript('');
      },
      onError: (error) => {
        console.error('Voice error:', error);
        store.setState('idle');
      },
    });

    // Connect to server
    console.log('[Scatty] Connecting to:', store.serverUrl);
    connectToServer();
    // Note: Can't auto-start mic - browsers require user interaction first

    return () => {
      voiceService.destroy();
      // Don't disconnect socket on unmount - connection persists across navigation
      // scattyClient.disconnect();
    };
  }, []);

  const connectToServer = useCallback(async () => {
    try {
      await scattyClient.connect(store.serverUrl, store.sessionId);
      store.setConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
      store.setConnected(false);
    }
  }, [store.serverUrl, store.sessionId]);

  const handleFinalTranscript = useCallback((transcript: string) => {
    store.setLiveTranscript('');
    store.addMessage('user', transcript);
    store.setState('thinking');

    // Check for vision intent
    if (detectVisionIntent(transcript)) {
      // Will be handled by vision flow
      store.setState('looking');
    } else {
      scattyClient.sendTranscript(transcript, store.sessionId);
    }
  }, [store.sessionId]);

  const startListening = useCallback(async () => {
    // Unlock TTS on first user interaction (required for iOS Safari)
    if (Platform.OS === 'web') {
      ttsService.unlock();
    }
    await ttsService.stop();
    await voiceService.startListening();
  }, []);

  const stopListening = useCallback(async () => {
    await voiceService.stopListening();
  }, []);

  const sendText = useCallback((text: string) => {
    if (!text.trim()) return;
    // Unlock TTS on first user interaction (required for iOS Safari)
    if (Platform.OS === 'web') {
      ttsService.unlock();
    }
    console.log('[Scatty] Sending text:', text, 'connected:', scattyClient.isConnected);
    store.addMessage('user', text);
    store.setState('thinking');
    scattyClient.sendTranscript(text, store.sessionId);
  }, [store.sessionId]);

  const sendVision = useCallback((text: string, frame: string) => {
    console.log('[Scatty] Sending vision, text:', text, 'frame length:', frame?.length);
    store.addMessage('user', text, true);
    store.setState('looking');
    // Small delay for UX, then send
    setTimeout(() => {
      store.setState('thinking');
      scattyClient.sendVision(text, frame, store.sessionId);
    }, 500);
  }, [store.sessionId]);

  const reconnect = useCallback(async () => {
    scattyClient.disconnect();
    await connectToServer();
  }, [connectToServer]);

  return {
    // State
    state: store.state,
    connected: store.connected,
    messages: store.messages,
    currentResponse: store.currentResponse,
    currentEmotion: store.currentEmotion,
    liveTranscript: store.liveTranscript,

    // Actions
    startListening,
    stopListening,
    sendText,
    sendVision,
    reconnect,
    setServerUrl: store.setServerUrl,
    resetSession: store.resetSession,
  };
}
