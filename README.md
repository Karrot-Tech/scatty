# Scatty

A sensor-aware AI assistant for Android, inspired by Reachy Mini. Scatty uses your phone's microphone and camera to have natural conversations powered by Google Gemini.

## Features

- Voice input with on-device speech recognition
- Streaming AI responses from Gemini
- Text-to-speech output
- Animated avatar with state-driven expressions
- Conversation history
- Session management
- Configurable server URL

## Prerequisites

- Node.js 18+
- npm 9+
- Android Studio (for Android emulator) or physical Android device
- Expo Go app (for quick testing) or development build
- Google Gemini API key

## Getting Started

### 1. Install Dependencies

```bash
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
npm run server
```

### 5. Start the Mobile App

In a new terminal:

```bash
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

## Building for Production

### EAS Build (Android APK)

EAS builds must be run from the mobile app directory (not the monorepo root):

```bash
cd apps/mobile
eas build --platform android --profile preview
```

See [Deployment Guide](DEPLOYMENT.md) for full instructions.

## Documentation

- [Architecture](ARCHITECTURE.md) - System design and component overview
- [Deployment](DEPLOYMENT.md) - Production deployment guides

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
cd apps/mobile
npx expo start --clear
```

### Monorepo dependency issues
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
npm run build:shared
```

## License

MIT
