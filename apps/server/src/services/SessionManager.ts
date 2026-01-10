import { Message, generateMessageId } from '@scatty/shared';

interface Session {
  id: string;
  messages: Message[];
  createdAt: number;
  lastActivity: number;
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private readonly maxAge = 30 * 60 * 1000; // 30 minutes

  create(sessionId: string): Session {
    const session: Session = {
      id: sessionId,
      messages: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    this.sessions.set(sessionId, session);
    this.cleanup();
    return session;
  }

  get(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  getOrCreate(sessionId: string): Session {
    return this.get(sessionId) || this.create(sessionId);
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string, hasImage?: boolean): Message {
    const session = this.getOrCreate(sessionId);
    const message: Message = {
      id: generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
      hasImage,
    };
    session.messages.push(message);
    return message;
  }

  getHistory(sessionId: string): Message[] {
    const session = this.get(sessionId);
    return session?.messages || [];
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActivity > this.maxAge) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionManager = new SessionManager();
