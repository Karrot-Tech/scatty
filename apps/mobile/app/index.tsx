import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScattyAvatar } from '../src/components/ScattyAvatar';
import { StatusHeader } from '../src/components/StatusHeader';
import { ActionBar } from '../src/components/ActionBar';
import { CameraModal } from '../src/components/CameraModal';
import { useScatty } from '../src/hooks/useScatty';
import { Message } from '@scatty/shared';

const COLORS = {
  idle: '#64748B',
  listening: '#3B82F6',
  thinking: '#F59E0B',
  speaking: '#10B981',
  looking: '#8B5CF6',
};

const STATE_LABELS: Record<string, string> = {
  idle: 'Ready to chat',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
  looking: 'Looking...',
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {message.hasImage && (
        <View style={styles.imageIndicator}>
          <Text style={styles.imageIndicatorText}>+ image</Text>
        </View>
      )}
      <Text style={[styles.messageText, isUser && styles.userMessageText]}>
        {message.content}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const {
    state,
    connected,
    messages,
    currentResponse,
    liveTranscript,
    startListening,
    stopListening,
    sendText,
    sendVision,
  } = useScatty();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraPrompt, setCameraPrompt] = useState<string | undefined>();

  const handleCameraPress = () => {
    console.log('[Scatty] Camera button pressed, opening modal');
    setCameraPrompt(undefined);
    setCameraVisible(true);
  };

  const handleCameraCapture = (base64: string) => {
    const prompt = cameraPrompt || "What do you see in this image?";
    sendVision(prompt, base64);
    setCameraPrompt(undefined);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusHeader connected={connected} />

      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <ScattyAvatar state={state} />
        <View style={[styles.statusBubble, { backgroundColor: COLORS[state] + '20' }]}>
          <Text style={[styles.statusText, { color: COLORS[state] }]}>
            {STATE_LABELS[state]}
          </Text>
        </View>
      </View>

      {/* Conversation section */}
      <View style={styles.conversationSection}>
        {messages.length === 0 && !currentResponse ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Tap the microphone to start talking
            </Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messageList}
            inverted={false}
          />
        )}

        {/* Current streaming response */}
        {currentResponse ? (
          <View style={[styles.messageBubble, styles.assistantBubble, styles.streamingBubble]}>
            <Text style={styles.messageText}>{currentResponse}</Text>
            <View style={styles.streamingIndicator}>
              <View style={[styles.streamingDot, styles.dot1]} />
              <View style={[styles.streamingDot, styles.dot2]} />
              <View style={[styles.streamingDot, styles.dot3]} />
            </View>
          </View>
        ) : null}
      </View>

      {/* Action bar */}
      <ActionBar
        state={state}
        liveTranscript={liveTranscript}
        onMicPress={startListening}
        onMicRelease={stopListening}
        onCameraPress={handleCameraPress}
        onSendText={sendText}
      />

      {/* Camera modal */}
      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCameraCapture}
        prompt={cameraPrompt}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusBubble: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  conversationSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
  },
  messageList: {
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6C5CE7',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A2E',
  },
  streamingBubble: {
    borderColor: '#10B981',
    borderWidth: 1,
  },
  messageText: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  imageIndicator: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  imageIndicatorText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '500',
  },
  streamingIndicator: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    opacity: 0.5,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
});
