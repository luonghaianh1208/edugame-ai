import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCodePatchPrompt } from "@/lib/prompts/codePatchPrompt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentCode, message, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Chưa cấu hình API key." }, { status: 401 });
    }
    if (!message) {
      return NextResponse.json({ error: "Thiếu nội dung tin nhắn." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.4,
      },
    });

    const systemPrompt = getCodePatchPrompt();

    const userMessage = currentCode
      ? `## CODE GAME HIỆN TẠI:\n\`\`\`html\n${currentCode}\n\`\`\`\n\n## YÊU CẦU:\n${message}`
      : message;

    const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
    let text = result.response.text().trim();

    // Strip markdown code fences from JSON
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```\s*$/, "").trim();

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({
        reply: parsed.reply || "Đã xử lý yêu cầu.",
        code: parsed.code || null,
        success: true,
      });
    } catch {
      // If not JSON, treat the response as a plain text reply
      // Check if it contains HTML code
      const htmlMatch = text.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
      if (htmlMatch) {
        return NextResponse.json({
          reply: "Đã cập nhật code theo yêu cầu.",
          code: htmlMatch[0],
          success: true,
        });
      }
      return NextResponse.json({
        reply: text,
        code: null,
        success: true,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return NextResponse.json({ error: `Lỗi AI: ${message}` }, { status: 500 });
  }
}
