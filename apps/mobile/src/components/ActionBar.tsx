import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScattyState } from '@scatty/shared';

interface Props {
  state: ScattyState;
  liveTranscript: string;
  onMicPress: () => void;
  onMicRelease: () => void;
  onCameraPress: () => void;
  onSendText: (text: string) => void;
}

const COLORS = {
  idle: '#64748B',
  listening: '#3B82F6',
  thinking: '#F59E0B',
  speaking: '#10B981',
  looking: '#8B5CF6',
};

export function ActionBar({
  state,
  liveTranscript,
  onMicPress,
  onMicRelease,
  onCameraPress,
  onSendText,
}: Props) {
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textInput, setTextInput] = useState('');

  const isListening = state === 'listening';
  const isProcessing = state === 'thinking' || state === 'speaking';

  const handleSendText = () => {
    if (textInput.trim()) {
      onSendText(textInput.trim());
      setTextInput('');
      setTextModalVisible(false);
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      onMicRelease();
    } else if (!isProcessing) {
      onMicPress();
    }
  };

  return (
    <View style={styles.container}>
      {/* Live transcript display */}
      {liveTranscript ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>{liveTranscript}</Text>
        </View>
      ) : null}

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        {/* Camera button */}
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            console.log('[ActionBar] Camera button tapped');
            onCameraPress();
          }}
          disabled={isProcessing}
        >
          <Ionicons
            name="camera-outline"
            size={24}
            color={isProcessing ? '#475569' : '#94A3B8'}
          />
          <Text style={[styles.buttonLabel, isProcessing && styles.buttonLabelDisabled]}>
            Look
          </Text>
        </TouchableOpacity>

        {/* Microphone button (primary) */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: isListening ? COLORS.listening : '#6C5CE7' },
          ]}
          onPress={handleMicPress}
          disabled={isProcessing}
        >
          <Ionicons
            name={isListening ? 'stop' : 'mic'}
            size={32}
            color="#FFFFFF"
          />
          <Text style={styles.primaryButtonLabel}>
            {isListening ? 'Stop' : 'Talk'}
          </Text>
        </TouchableOpacity>

        {/* Keyboard button */}
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setTextModalVisible(true)}
          disabled={isProcessing}
        >
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={isProcessing ? '#475569' : '#94A3B8'}
          />
          <Text style={[styles.buttonLabel, isProcessing && styles.buttonLabelDisabled]}>
            Type
          </Text>
        </TouchableOpacity>
      </View>

      {/* Text input modal */}
      <Modal
        visible={textModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTextModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setTextModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message Scatty</Text>
              <TouchableOpacity onPress={() => setTextModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={textInput}
                onChangeText={setTextInput}
                placeholder="Type your message..."
                placeholderTextColor="#64748B"
                multiline
                autoFocus
                returnKeyType="send"
                onSubmitEditing={handleSendText}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !textInput.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSendText}
                disabled={!textInput.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={textInput.trim() ? '#FFFFFF' : '#475569'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transcriptContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  transcriptText: {
    color: '#E2E8F0',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A1A2E',
  },
  primaryButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },
  buttonLabelDisabled: {
    color: '#475569',
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1A1A2E',
  },
});
