import { useEffect, useCallback, useRef } from 'react';
import { useScattyStore } from '../state/store';
import { scattyClient } from '../services/ScattyClient';
import { voiceService } from '../services/VoiceService';
import { ttsService } from '../services/TTSService';
import { detectVisionIntent, ScattyState } from '@scatty/shared';

export function useScatty() {
  const store = useScattyStore();
  const isInitialized = useRef(false);

  // Setup socket event listeners FIRST (before connection)
  useEffect(() => {
    console.log('[Scatty] Setting up socket listeners');

    const unsubChunk = scattyClient.on('response:chunk', (payload: any) => {
      console.log('[Scatty] Received chunk:', payload.text?.substring(0, 20));
      store.appendCurrentResponse(payload.text);
    });

    const unsubComplete = scattyClient.on('response:complete', (payload: any) => {
      console.log('[Scatty] Response complete');
      store.finalizeResponse();
      store.setState('idle');
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
        // Voice stopped, handled by results callback
      },
      onError: (error) => {
        console.error('Voice error:', error);
        store.setState('idle');
      },
    });

    // Connect to server
    console.log('[Scatty] Connecting to:', store.serverUrl);
    connectToServer();

    return () => {
      voiceService.destroy();
      scattyClient.disconnect();
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
    await ttsService.stop();
    await voiceService.startListening();
  }, []);

  const stopListening = useCallback(async () => {
    await voiceService.stopListening();
  }, []);

  const sendText = useCallback((text: string) => {
    if (!text.trim()) return;
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
