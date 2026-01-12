import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useScattyStore } from '../src/state/store';
import { useScatty } from '../src/hooks/useScatty';
import { colors } from '../src/theme';
import { ttsService, VoiceInfo } from '../src/services/TTSService';

interface VoicePickerProps {
    voices: VoiceInfo[];
    selectedVoice: string | null;
    onSelectVoice: (voiceName: string | null) => void;
}

function VoicePicker({ voices, selectedVoice, onSelectVoice }: VoicePickerProps) {
    // Check if iOS Safari
    const isIOSSafari = typeof navigator !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /Safari/.test(navigator.userAgent) &&
        !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    return (
        <View style={styles.voiceList}>
            {isIOSSafari && (
                <View style={styles.iosWarning}>
                    <Ionicons name="information-circle" size={16} color={colors.accent.warning} />
                    <Text style={styles.iosWarningText}>
                        iOS Safari requires selecting a specific voice
                    </Text>
                </View>
            )}
            {!isIOSSafari && (
                <TouchableOpacity
                    style={[
                        styles.voiceItem,
                        selectedVoice === null && styles.voiceItemSelected,
                    ]}
                    onPress={() => onSelectVoice(null)}
                >
                    <Text style={styles.voiceName}>Auto (Best Available)</Text>
                    {selectedVoice === null && (
                        <Ionicons name="checkmark" size={20} color={colors.accent.success} />
                    )}
                </TouchableOpacity>
            )}
            {voices.map((voice) => (
                <TouchableOpacity
                    key={voice.name}
                    style={[
                        styles.voiceItem,
                        selectedVoice === voice.name && styles.voiceItemSelected,
                    ]}
                    onPress={() => onSelectVoice(voice.name)}
                >
                    <View style={styles.voiceInfo}>
                        <Text style={styles.voiceName}>{voice.name}</Text>
                        <Text style={styles.voiceLang}>
                            {voice.lang} {voice.isLocal ? '(local)' : '(network)'}
                        </Text>
                    </View>
                    {selectedVoice === voice.name && (
                        <Ionicons name="checkmark" size={20} color={colors.accent.success} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function SettingsScreen() {
    const router = useRouter();
    const { serverUrl, sessionId, selectedVoice, setSelectedVoice } = useScattyStore();
    const { reconnect, resetSession, setServerUrl } = useScatty();

    const [urlInput, setUrlInput] = useState(serverUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [voices, setVoices] = useState<VoiceInfo[]>([]);

    useEffect(() => {
        // Check if iOS Safari
        const isIOSSafari = typeof navigator !== 'undefined' &&
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            /Safari/.test(navigator.userAgent) &&
            !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

        // Load voices - may need to wait for them to be available
        const loadVoices = () => {
            if (Platform.OS === 'web' && typeof ttsService !== 'undefined') {
                const availableVoices = ttsService.getAvailableVoices();
                setVoices(availableVoices);

                // Auto-select Samantha on iOS Safari if no voice selected
                if (isIOSSafari && !selectedVoice && availableVoices.length > 0) {
                    const samantha = availableVoices.find(v => v.name === 'Samantha');
                    if (samantha) {
                        setSelectedVoice('Samantha');
                        ttsService.setVoice('Samantha');
                    } else if (availableVoices[0]) {
                        setSelectedVoice(availableVoices[0].name);
                        ttsService.setVoice(availableVoices[0].name);
                    }
                }
            }
        };

        loadVoices();

        // Chrome loads voices async
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const handleVoiceSelect = (voiceName: string | null) => {
        setSelectedVoice(voiceName);
        if (Platform.OS === 'web' && typeof ttsService !== 'undefined') {
            ttsService.setVoice(voiceName);
            // Test the voice
            ttsService.speak('Hello, I am Scatty!');
        }
    };

    const handleSaveUrl = async () => {
        if (!urlInput.trim()) {
            alert('Server URL cannot be empty');
            return;
        }

        setIsSaving(true);
        setServerUrl(urlInput.trim());

        try {
            await reconnect();
            alert('Connected to new server');
        } catch (error) {
            alert('Connection Failed: Could not connect to the server');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetSession = () => {
        if (confirm('This will clear all conversation history. Continue?')) {
            resetSession();
            router.back();
        }
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

            <ScrollView style={styles.content}>
                {/* Voice Selection Section - Web Only */}
                {Platform.OS === 'web' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Voice</Text>
                        <Text style={styles.sectionDescription}>
                            Choose Scatty's speaking voice
                        </Text>
                        {voices.length > 0 ? (
                            <VoicePicker
                                voices={voices}
                                selectedVoice={selectedVoice}
                                onSelectVoice={handleVoiceSelect}
                            />
                        ) : (
                            <Text style={styles.noVoicesText}>
                                Loading voices...
                            </Text>
                        )}
                    </View>
                )}

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
                            placeholder="https://scatty-production.up.railway.app"
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

                </View>
            </ScrollView>
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
    voiceList: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.ui.border,
        overflow: 'scroll',
        maxHeight: 300,
    },
    voiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.ui.border,
    },
    voiceItemSelected: {
        backgroundColor: colors.accent.primary + '15',
    },
    voiceInfo: {
        flex: 1,
    },
    voiceName: {
        color: colors.text.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    voiceLang: {
        color: colors.text.muted,
        fontSize: 12,
        marginTop: 2,
    },
    noVoicesText: {
        color: colors.text.muted,
        fontSize: 14,
        fontStyle: 'italic',
    },
    iosWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.accent.warning + '20',
        borderBottomWidth: 1,
        borderBottomColor: colors.ui.border,
        gap: 8,
    },
    iosWarningText: {
        color: colors.text.secondary,
        fontSize: 13,
        flex: 1,
    },
});
