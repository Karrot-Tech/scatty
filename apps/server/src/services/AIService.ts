import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { Message } from '@scatty/shared';

const SYSTEM_PROMPT = `You are Scatty, a friendly and helpful AI assistant. You have a playful personality but are always helpful and accurate.

Key traits:
- Warm and approachable
- Concise but thorough
- You can see images when the user shows you things
- You speak naturally, as if having a conversation

Keep responses conversational and relatively brief (2-3 sentences typically) unless the user asks for more detail.`;

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  initialize(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  private buildContents(history: Message[], currentMessage: string, image?: string): Content[] {
    const contents: Content[] = [];

    // Add conversation history
    for (const msg of history.slice(-10)) { // Last 10 messages for context
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current message
    if (image) {
      contents.push({
        role: 'user',
        parts: [
          { text: currentMessage },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: image.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
        ],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: currentMessage }],
      });
    }

    return contents;
  }

  async *streamResponse(
    history: Message[],
    userMessage: string,
    image?: string
  ): AsyncGenerator<string, void, unknown> {
    if (!this.model) {
      throw new Error('AI Service not initialized. Set GEMINI_API_KEY.');
    }

    const contents = this.buildContents(history, userMessage, image);

    try {
      const result = await this.model.generateContentStream({
        contents,
        systemInstruction: SYSTEM_PROMPT,
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async generateResponse(
    history: Message[],
    userMessage: string,
    image?: string
  ): Promise<string> {
    let fullResponse = '';
    for await (const chunk of this.streamResponse(history, userMessage, image)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }
}

export const aiService = new AIService();
