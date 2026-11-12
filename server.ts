import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize GoogleGenAI client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface PolicySourceChunk {
  title: string;
  pageNumber: number | string | null;
  textSnippet: string; // First 300 characters of retrievedContext.text
  fullText: string;
}

export interface PolicyAskResponse {
  answer: string;
  sources: PolicySourceChunk[];
  rawChunkCount: number;
  question: string;
}

// Georgetown MBA policy store identifier (can be overridden via FILE_SEARCH_STORE_NAME env var)
const GEORGETOWN_MBA_FILE_SEARCH_STORE =
  process.env.FILE_SEARCH_STORE_NAME || 'fileSearchStores/mbapolicies-ldjpw9byydqw';


app.post('/api/policy/ask', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Please enter a valid policy question.' });
    }

    const trimmedQuestion = question.trim();

    // Call Gemini 3.5 Flash with the fileSearch tool and strict system instruction
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: trimmedQuestion,
      config: {
        systemInstruction:
          'answer only from the retrieved policy passages, and say so plainly if the policies do not cover the question.',
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [GEORGETOWN_MBA_FILE_SEARCH_STORE],
            },
          },
        ],
      },
    });

    const answer = response.text || '';
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: PolicySourceChunk[] = [];

    for (const chunk of rawChunks) {
      const rc = chunk.retrievedContext;
      if (rc) {
        const fullText = (rc.text || '').trim();
        sources.push({
          title: rc.title || 'Georgetown MBA Policy Document',
          pageNumber: rc.pageNumber ?? null,
          textSnippet: fullText.slice(0, 300),
          fullText: fullText,
        });
      }
    }

    const responsePayload: PolicyAskResponse = {
      answer,
      sources,
      rawChunkCount: sources.length,
      question: trimmedQuestion,
    };

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('Error querying policy assistant:', error);
    let errorMessage =
      error?.message || 'An unexpected error occurred while consulting Georgetown MBA policies.';
    try {
      const parsed = typeof errorMessage === 'string' && errorMessage.startsWith('{') ? JSON.parse(errorMessage) : null;
      if (parsed?.error?.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
      // Keep original errorMessage
    }
    return res.status(500).json({ error: errorMessage });
  }
});

const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MBA Policy Assistant server active on port ${port}`);
  });
}

startServer();
