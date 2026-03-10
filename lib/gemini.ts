import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say 'OK' in one word.");
    const text = result.response.text();
    return text.length > 0;
  } catch {
    return false;
  }
}
