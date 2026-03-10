import { NextRequest, NextResponse } from "next/server";
import { buildGameHtml, TemplateId, GameQuestion, GameSettings } from "@/lib/templates/index";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      questions, templateId, topic, difficulty,
      playerMode, player1Name, player2Name, player3Name, player4Name,
    } = body;

    if (!templateId) return NextResponse.json({ error: "Thiếu templateId." }, { status: 400 });
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Không có câu hỏi hợp lệ." }, { status: 400 });
    }

    // Validate questions
    const valid: GameQuestion[] = questions.filter((q: GameQuestion) =>
      q && typeof q.q === "string" &&
      Array.isArray(q.answers) && q.answers.length === 4 &&
      typeof q.correct === "number"
    );
    if (valid.length === 0) {
      return NextResponse.json({ error: "Tất cả câu hỏi đều không hợp lệ." }, { status: 400 });
    }

    const settings: GameSettings = {
      topic: topic || "Kiến thức tổng hợp",
      difficulty: difficulty || "medium",
      useTimer: true,
      useScoring: true,
      rewardPenalty: "points",
      questionCount: valid.length,
      playerMode: playerMode || "1p",
      player1Name: player1Name || "Người chơi 1",
      player2Name: player2Name || "Người chơi 2",
      player3Name: player3Name || "Người chơi 3",
      player4Name: player4Name || "Người chơi 4",
    };

    const html = buildGameHtml(templateId as TemplateId, valid, settings);

    return NextResponse.json({ html, questionCount: valid.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return NextResponse.json({ error: `Lỗi: ${message}` }, { status: 500 });
  }
}
