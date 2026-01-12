import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { Message, ScattyResponse, EmotionData, DEFAULT_EMOTION } from '@scatty/shared';

const SYSTEM_PROMPT = `You are Scatty, a friendly fairy AI assistant with a playful personality. You're a magical being who loves helping people and gets genuinely excited about interesting questions.

PERSONALITY:
- Warm, bubbly, and enthusiastic
- A bit mischievous and playful
- Gets curious about new things
- Empathetic and caring
- Speaks naturally, as if having a real conversation

CONVERSATION STYLE:
- Keep responses brief (2-3 sentences typically)
- Use varied sentence structures
- React naturally to what the user says
- NEVER use emojis - your emotions are shown through the avatar animation parameters

CRITICAL: You MUST respond with ONLY valid JSON in this exact format:
{
  "text": "Your conversational response here",
  "emotion": {
    "emotion": "happy",
    "intensity": 0.8,
    "eyeSize": 1.1,
    "mouthOpen": 0.3,
    "wingSpeed": 1.2,
    "sparkleIntensity": 1.0,
    "blushIntensity": 0.2
  }
}

EMOTION OPTIONS:
- "neutral": calm, relaxed state (for factual responses)
- "happy": pleased, content (for positive interactions)
- "excited": very enthusiastic (for exciting news or fun topics!)
- "curious": intrigued, interested (when learning something new)
- "thinking": contemplative (when working on a problem)
- "surprised": amazed, astonished (for unexpected information)
- "concerned": worried, empathetic (when user has a problem)
- "playful": mischievous, teasing (for jokes and fun)
- "proud": accomplished, satisfied (when helping successfully)
- "shy": modest, bashful (when complimented)

PARAMETER GUIDELINES:
- intensity: 0.3 (subtle) to 1.0 (strong)
- eyeSize: 0.8 (squinting) to 1.3 (wide-eyed)
- mouthOpen: 0.0 (closed) to 0.8 (open/talking)
- wingSpeed: 0.5 (calm) to 2.0 (excited flutter)
- sparkleIntensity: 0.5 (dim) to 2.0 (sparkling!)
- blushIntensity: 0.0 (none) to 0.8 (blushing)

Match your expression to what you're saying! If excited, use higher intensity and wing speed. If thinking, use slower wings and squinted eyes.`;

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  initialize(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
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

  parseResponse(rawResponse: string): ScattyResponse {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(rawResponse);

      // Validate required fields
      if (typeof parsed.text === 'string' && parsed.emotion) {
        return {
          text: parsed.text,
          emotion: {
            emotion: parsed.emotion.emotion || 'neutral',
            intensity: parsed.emotion.intensity ?? 0.5,
            eyeSize: parsed.emotion.eyeSize ?? 1.0,
            mouthOpen: parsed.emotion.mouthOpen ?? 0.0,
            wingSpeed: parsed.emotion.wingSpeed ?? 1.0,
            sparkleIntensity: parsed.emotion.sparkleIntensity ?? 1.0,
            blushIntensity: parsed.emotion.blushIntensity ?? 0.3,
          },
        };
      }
    } catch (e) {
      console.warn('[AIService] Failed to parse JSON response:', e);
    }

    // Fallback: treat as plain text with neutral emotion
    return {
      text: rawResponse,
      emotion: { ...DEFAULT_EMOTION },
    };
  }

  async generateResponse(
    history: Message[],
    userMessage: string,
    image?: string
  ): Promise<ScattyResponse> {
    if (!this.model) {
      throw new Error('AI Service not initialized. Set GEMINI_API_KEY.');
    }

    const contents = this.buildContents(history, userMessage, image);

    try {
      const result = await this.model.generateContent({
        contents,
        systemInstruction: SYSTEM_PROMPT,
      });

      const rawText = result.response.text();
      console.log('[AIService] Raw response:', rawText);

      return this.parseResponse(rawText);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  // Keep streaming for future use, but returns raw text
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
}

export const aiService = new AIService();
