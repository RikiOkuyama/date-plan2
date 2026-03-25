import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('VITE_GEMINI_API_KEY が設定されていません');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateText(prompt: string): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function chatWithHistory(
  history: Array<{ role: 'user' | 'model'; parts: string }>,
  userMessage: string
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.parts }],
    })),
    generationConfig: {
      maxOutputTokens: 2048,
    },
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function generateChatSuggestions(
  input: string,
  planSummary: string
): Promise<string[]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `デートプランのAI編集チャットです。
現在のプラン概要: ${planSummary}

ユーザーが「${input}」と入力しています。このリクエストを完成させる自然な候補を3つ提案してください。
JSON配列のみで返してください（他のテキスト不要）: ["候補1", "候補2", "候補3"]`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  const parsed = JSON.parse(match[0]);
  return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
}

export function isApiKeyConfigured(): boolean {
  return !!apiKey && apiKey !== 'your_gemini_api_key_here';
}
