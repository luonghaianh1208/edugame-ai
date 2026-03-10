import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGameGeneratorPrompt, GameGeneratorParams } from "@/lib/prompts/gameGeneratorPrompt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, gameType, questionCount, difficulty, useTimer, useScoring, rewardPenalty, description, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Chưa cấu hình API key." }, { status: 401 });
    }
    if (!topic || !gameType || !questionCount) {
      return NextResponse.json({ error: "Thiếu: chủ đề, loại game, số câu" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { maxOutputTokens: 65536, temperature: 0.35 },
    });

    const params: GameGeneratorParams = {
      topic, gameType,
      questionCount: Number(questionCount),
      difficulty: difficulty || "medium",
      useTimer: useTimer !== false,
      useScoring: useScoring !== false,
      rewardPenalty: rewardPenalty || "points",
      description,
    };

    const prompt = getGameGeneratorPrompt(params);

    // ── Streaming response ───────────────────────────────────────────
    const streamResult = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              // Send each chunk as a Server-Sent Events style data line
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`\n__STREAM_ERROR__:${msg}`));
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
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    if (message.toLowerCase().includes("api key")) {
      return NextResponse.json({ error: "API key không hợp lệ hoặc hết quota." }, { status: 401 });
    }
    return NextResponse.json({ error: `Lỗi: ${message}` }, { status: 500 });
  }
}
