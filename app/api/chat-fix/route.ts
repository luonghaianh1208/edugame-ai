import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCodePatchPrompt } from "@/lib/prompts/codePatchPrompt";

// Stream-based response to avoid JSON-in-JSON issues with large HTML payloads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentCode, message, apiKey } = body;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Chưa cấu hình API key." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Thiếu nội dung tin nhắn." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 8192, temperature: 0.4 },
    });

    const systemPrompt = getCodePatchPrompt();
    const userMessage = currentCode
      ? `## CODE GAME HIỆN TẠI:\n\`\`\`html\n${currentCode}\n\`\`\`\n\n## YÊU CẦU:\n${message}`
      : `## YÊU CẦU:\n${message}`;

    const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

    // ── Stream the response ───────────────────────────────────────────
    const streamResult = await model.generateContentStream(fullPrompt);
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`\n__CHAT_ERROR__:${msg}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return new Response(
      JSON.stringify({ error: `Lỗi: ${message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
