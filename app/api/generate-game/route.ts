import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDataGeneratorPrompt } from "@/lib/prompts/dataGeneratorPrompt";
import { buildGameHtml, TemplateId, GameQuestion, GameSettings } from "@/lib/templates/index";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic, templateId, questionCount, difficulty,
      useTimer, useScoring, rewardPenalty, apiKey
    } = body;

    if (!apiKey)       return NextResponse.json({ error: "Chưa cấu hình API key." }, { status: 401 });
    if (!topic)        return NextResponse.json({ error: "Thiếu chủ đề bài học." }, { status: 400 });
    if (!templateId)   return NextResponse.json({ error: "Chưa chọn template trò chơi." }, { status: 400 });

    const count = Number(questionCount) || 10;

    // 1. Ask AI for JSON data only (not full HTML)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { maxOutputTokens: 8192, temperature: 0.35 },
    });

    const prompt = getDataGeneratorPrompt(templateId, topic, count, difficulty || "medium");
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // 2. Parse JSON — strip markdown fences if present
    let jsonStr = raw;
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();
    // Find the array
    const arrStart = jsonStr.indexOf("[");
    const arrEnd   = jsonStr.lastIndexOf("]");
    if (arrStart === -1 || arrEnd === -1) {
      return NextResponse.json({ error: "AI không trả về dữ liệu JSON hợp lệ. Hãy thử lại." }, { status: 500 });
    }
    jsonStr = jsonStr.slice(arrStart, arrEnd + 1);

    let questions: GameQuestion[];
    try {
      questions = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Lỗi phân tích dữ liệu câu hỏi. Hãy thử lại." }, { status: 500 });
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "AI trả về không đủ câu hỏi." }, { status: 500 });
    }
    questions = questions.filter(q =>
      q && typeof q.q === "string" &&
      Array.isArray(q.answers) && q.answers.length === 4 &&
      typeof q.correct === "number"
    );
    if (questions.length === 0) {
      return NextResponse.json({ error: "Dữ liệu câu hỏi không đúng định dạng." }, { status: 500 });
    }

    // 3. Inject into template
    const settings: GameSettings = {
      topic, difficulty: difficulty || "medium",
      useTimer: useTimer !== false,
      useScoring: useScoring !== false,
      rewardPenalty: rewardPenalty || "points",
      questionCount: questions.length,
    };

    const html = buildGameHtml(templateId as TemplateId, questions, settings);

    return NextResponse.json({
      html,
      questionCount: questions.length,
      templateId,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    if (message.toLowerCase().includes("api key")) {
      return NextResponse.json({ error: "API key không hợp lệ hoặc hết quota." }, { status: 401 });
    }
    return NextResponse.json({ error: `Lỗi: ${message}` }, { status: 500 });
  }
}
