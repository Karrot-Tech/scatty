# Scatty

A sensor-aware AI assistant for Android, inspired by Reachy Mini. Scatty uses your phone's microphone and camera to have natural conversations powered by Google Gemini.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   ANDROID DEVICE                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │            REACT NATIVE (Scatty UI)               │  │
│  │   📷 Camera   🎤 Mic   🔊 Speaker   📱 Screen     │  │
│  │        │         │          ▲           ▲        │  │
│  │        ▼         ▼          │           │        │  │
│  │   ┌─────────────────────────────────────────┐    │  │
│  │   │      Scatty Client / Zustand Store      │    │  │
│  │   └──────────────────┬──────────────────────┘    │  │
│  └──────────────────────│───────────────────────────┘  │
└─────────────────────────│───────────────────────────────┘
                          │ Socket.io
                          ▼
┌──────────────────────────────────────────────────────────┐
│              NODE.JS BACKEND (Scatty Server)             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │  Socket.io   │  │   Session    │  │   AI Service  │   │
│  │   Handler    │◄►│   Manager    │◄►│   (Gemini)    │   │
│  └──────────────┘  └──────────────┘  └───────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- npm 9+
- Android Studio (for Android emulator) or physical Android device
- Expo Go app (for quick testing) or development build
- Google Gemini API key

## Quick Start

### 1. Install Dependencies

```bash
cd scatty
npm install
```

### 2. Build Shared Types

```bash
npm run build:shared
```

### 3. Configure Server

```bash
cd apps/server
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

Get a free API key at: https://aistudio.google.com/apikey

### 4. Start the Server

```bash
# From root directory
npm run server
```

You should see:
```
╔═══════════════════════════════════════╗
║         🤖 Scatty Server              ║
╠═══════════════════════════════════════╣
║  HTTP:      http://localhost:3001     ║
║  WebSocket: ws://localhost:3001       ║
╚═══════════════════════════════════════╝
```

### 5. Start the Mobile App

In a new terminal:

```bash
# From root directory
npm run mobile
```

Then press:
- `a` - Open on Android emulator
- `i` - Open on iOS simulator (Mac only)
- Scan QR code with Expo Go app on physical device

> **Note:** Voice recognition requires a physical device or properly configured emulator with microphone access.

## Testing on Physical Device

1. Find your computer's local IP:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

2. Start the server (it binds to all interfaces)

3. In the Scatty app, tap the **Settings** icon (top-left)

4. Change the server URL to: `http://YOUR_IP:3001`

5. Tap **Save & Reconnect**

## Project Structure

```
scatty/
├── packages/
│   └── shared/              # Shared types & protocol
│       └── src/index.ts     # Message types, events, utils
│
├── apps/
│   ├── server/              # Node.js backend
│   │   └── src/
│   │       ├── index.ts     # Express + Socket.io entry
│   │       ├── socket/      # WebSocket handlers
│   │       └── services/    # SessionManager, AIService
│   │
│   └── mobile/              # React Native (Expo)
│       ├── app/             # Expo Router screens
│       │   ├── _layout.tsx  # Root layout
│       │   ├── index.tsx    # Main screen
│       │   └── settings.tsx # Settings screen
│       └── src/
│           ├── components/  # UI components
│           ├── services/    # ScattyClient, Voice, TTS
│           ├── hooks/       # useScatty hook
│           └── state/       # Zustand store
│
└── package.json             # Monorepo root
```

## Current Features

- ✅ Voice input with on-device speech recognition
- ✅ Streaming AI responses from Gemini
- ✅ Text-to-speech output
- ✅ Animated avatar with state-driven expressions
- ✅ Conversation history
- ✅ Session management
- ✅ Configurable server URL

## Coming Soon (Phase 4)

- 📷 Camera capture for vision queries
- 🔍 "What do you see?" triggers camera
- 🖼️ Multimodal Gemini responses

## Troubleshooting

### "Connection failed" error
- Make sure the server is running
- Check that your device can reach the server IP
- Verify firewall isn't blocking port 3001

### Voice recognition not working
- Use a physical device (emulators have limited mic support)
- Check microphone permissions in device settings
- Try the "Type" button as fallback

### Metro bundler errors
```bash
# Clear cache and restart
cd apps/mobile
npx expo start --clear
```

### Monorepo dependency issues
```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
npm run build:shared
```

## Tech Stack

- **Mobile:** React Native, Expo, Expo Router, Zustand, Reanimated
- **Server:** Node.js, Express, Socket.io
- **AI:** Google Gemini 1.5 Flash
- **Voice:** react-native-voice (on-device STT)
- **TTS:** expo-speech

## License

MIT
