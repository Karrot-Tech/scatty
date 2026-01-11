import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useScattyStore } from '../src/state/store';
import { useScatty } from '../src/hooks/useScatty';
import { colors } from '../src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { serverUrl, sessionId } = useScattyStore();
  const { reconnect, resetSession, setServerUrl } = useScatty();

  const [urlInput, setUrlInput] = useState(serverUrl);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveUrl = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Error', 'Server URL cannot be empty');
      return;
    }

    setIsSaving(true);
    setServerUrl(urlInput.trim());

    try {
      await reconnect();
      Alert.alert('Success', 'Connected to new server');
    } catch (error) {
      Alert.alert('Connection Failed', 'Could not connect to the server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSession = () => {
    Alert.alert(
      'Reset Session',
      'This will clear all conversation history. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSession();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Server URL Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Connection</Text>
          <Text style={styles.sectionDescription}>
            Enter the URL of your Scatty server
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="http://localhost:3001"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSaveUrl}
            disabled={isSaving}
          >
            <Ionicons
              name={isSaving ? 'hourglass' : 'wifi'}
              size={18}
              color={colors.text.inverse}
            />
            <Text style={styles.buttonText}>
              {isSaving ? 'Connecting...' : 'Save & Reconnect'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Session Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Text style={styles.sectionDescription}>
            Current session ID
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText} numberOfLines={1}>
              {sessionId}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetSession}
          >
            <Ionicons name="refresh" size={18} color={colors.accent.error} />
            <Text style={[styles.buttonText, styles.dangerText]}>
              Reset Session
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Powered by</Text>
            <Text style={styles.infoValue}>🥕📡</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    color: colors.text.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  input: {
    color: colors.text.primary,
    fontSize: 15,
    padding: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
  },
  dangerButton: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.accent.error,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
  },
  dangerText: {
    color: colors.accent.error,
  },
  infoBox: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  infoText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  infoLabel: {
    color: colors.text.muted,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
