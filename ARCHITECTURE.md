# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   ANDROID DEVICE                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │            REACT NATIVE (Scatty UI)               │  │
│  │   Camera     Mic     Speaker     Screen           │  │
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

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, Expo, Expo Router, Zustand, Reanimated |
| Server | Node.js, Express, Socket.io |
| AI | Google Gemini 1.5 Flash |
| Voice | react-native-voice (on-device STT) |
| TTS | expo-speech |

## Communication Flow

1. **User speaks** → On-device speech recognition converts to text
2. **Client sends** → Socket.io event with user message to server
3. **Server processes** → SessionManager tracks context, AIService calls Gemini
4. **Streaming response** → Server streams AI response chunks back via Socket.io
5. **Client renders** → UI updates in real-time, TTS speaks the response

## Key Components

### Mobile App (`apps/mobile`)
- **ScattyClient**: WebSocket connection manager
- **VoiceService**: Speech recognition wrapper
- **TTSService**: Text-to-speech output
- **useScatty**: Main hook orchestrating all services
- **Zustand Store**: Global state management

### Server (`apps/server`)
- **Socket.io Handler**: WebSocket event routing
- **SessionManager**: Conversation context per client
- **AIService**: Gemini API integration with streaming

### Shared (`packages/shared`)
- TypeScript types for messages and events
- Utility functions (ID generators, etc.)
- Protocol constants
