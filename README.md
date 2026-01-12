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

## Deployment

### Server (Railway)

1. Push code to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Set environment variables:
   ```
   GEMINI_API_KEY=your_api_key
   ALLOWED_ORIGINS=*
   ```
4. Railway auto-deploys using `railway.toml` config

**Manual deploy:**
```bash
railway login
railway up
```

**Health check:** `https://your-app.railway.app/health`

---

### Mobile Android (EAS Build)

> All EAS commands must be run from `apps/mobile` directory.

```bash
cd apps/mobile
eas login
eas build --platform android --profile preview
```

**Build profiles:**
- `development` - Dev client with local server
- `preview` - APK for testing with production server
- `production` - Release APK

**Local build (requires Android SDK):**
```bash
cd apps/mobile
eas build --platform android --profile preview --local
```

---

### Mobile Web (Vercel)

> Deploy from `apps/mobile` directory.

```bash
cd apps/mobile
vercel login
vercel --prod
```

**First-time setup:**
- Build command: `cd ../.. && npm run build:shared && cd apps/mobile && npx expo export --platform web`
- Output directory: `dist`
- Install command: `cd ../.. && npm install`

**Environment variable:**
```
EXPO_PUBLIC_SERVER_URL=https://your-app.railway.app
```

**Local preview:**
```bash
cd apps/mobile
npx expo export --platform web
npx serve dist
```

---

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

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
