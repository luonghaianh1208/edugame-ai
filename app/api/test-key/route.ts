import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    if (!apiKey) return NextResponse.json({ valid: false, message: "API key không được để trống." });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Respond with only: OK");
    const text = result.response.text();
    if (text.length > 0) {
      return NextResponse.json({ valid: true, message: "API key hợp lệ! Sẵn sàng sử dụng." });
    }
    return NextResponse.json({ valid: false, message: "API key không phản hồi đúng." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return NextResponse.json({ valid: false, message: `API key không hợp lệ: ${message}` });
  }
}
