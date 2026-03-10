import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGameGeneratorPrompt, GameGeneratorParams } from "@/lib/prompts/gameGeneratorPrompt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, gameType, questionCount, difficulty, useTimer, useScoring, rewardPenalty, description, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Chưa cấu hình API key. Vui lòng vào cài đặt để nhập API key." }, { status: 401 });
    }
    if (!topic || !gameType || !questionCount) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc: chủ đề, loại game, số câu hỏi" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.8,
      },
    });

    const params: GameGeneratorParams = {
      topic, gameType, questionCount: Number(questionCount),
      difficulty: difficulty || "medium",
      useTimer: useTimer !== false,
      useScoring: useScoring !== false,
      rewardPenalty: rewardPenalty || "points",
      description,
    };

    const systemPrompt = getGameGeneratorPrompt(params);

    const result = await model.generateContent(systemPrompt);
    let code = result.response.text().trim();

    // Strip markdown fences if AI wraps in them
    code = code.replace(/^```html?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    if (!code.toLowerCase().includes("<!doctype html")) {
      return NextResponse.json({ error: "AI không trả về HTML hợp lệ. Hãy thử lại." }, { status: 500 });
    }

    return NextResponse.json({ code, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    if (message.toLowerCase().includes("api key")) {
      return NextResponse.json({ error: "API key không hợp lệ hoặc hết quota." }, { status: 401 });
    }
    return NextResponse.json({ error: `Lỗi tạo game: ${message}` }, { status: 500 });
  }
}
