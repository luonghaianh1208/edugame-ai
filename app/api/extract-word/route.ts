import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const apiKey = form.get("apiKey") as string | null;

    if (!apiKey) return NextResponse.json({ error: "Thiếu API key." }, { status: 401 });
    if (!file)   return NextResponse.json({ error: "Thiếu file Word." }, { status: 400 });

    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".docx") && !ext.endsWith(".doc")) {
      return NextResponse.json({ error: "Chỉ hỗ trợ file .docx hoặc .doc" }, { status: 400 });
    }

    // Convert file to ArrayBuffer → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use mammoth to extract HTML (preserves <u> underline, <strong> bold)
    const { value: html } = await mammoth.convertToHtml(
      { buffer },
      {
        styleMap: [
          "u => u",
          "b => strong",
        ],
      }
    );

    // Also get plain text for context
    const { value: plainText } = await mammoth.extractRawText({ buffer });

    // Build Gemini prompt
    const prompt = `Bạn là chuyên gia phân tích đề thi trắc nghiệm.

Tôi cung cấp cho bạn nội dung file Word được chuyển sang HTML. Trong file này, đáp án đúng được đánh dấu bằng:
- Chữ được gạch chân (<u>...</u>) 
- Chữ được in đậm (<strong>...</strong>)
- Hoặc có thể có chú thích như "Đáp án: A", "ĐÁ: B", "Correct: C" v.v.

Hãy phân tích và trích xuất TẤT CẢ câu hỏi trắc nghiệm từ nội dung HTML sau. Mỗi câu phải có đúng 4 đáp án A, B, C, D.

NỘI DUNG HTML:
\`\`\`
${html.substring(0, 12000)}
\`\`\`

NỘI DUNG PLAIN TEXT (tham khảo thêm):
\`\`\`
${plainText.substring(0, 4000)}
\`\`\`

Trả về JSON array theo định dạng sau (CHỈ JSON, không có text khác):
[
  {
    "q": "Nội dung câu hỏi",
    "answers": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct": 0,
    "explain": "Giải thích nếu có, để trống nếu không có"
  }
]

Trong đó "correct" là index (0=A, 1=B, 2=C, 3=D) của đáp án đúng được đánh dấu.
Nếu không xác định được đáp án đúng, đặt correct=0 và ghi chú trong explain.
Đảm bảo "answers" luôn có đúng 4 phần tử.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 8192, temperature: 0.1 },
    });

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Parse JSON
    let jsonStr = raw;
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();
    const arrStart = jsonStr.indexOf("[");
    const arrEnd = jsonStr.lastIndexOf("]");
    if (arrStart === -1 || arrEnd === -1) {
      return NextResponse.json({ error: "AI không trích xuất được câu hỏi từ file này. Hãy kiểm tra định dạng." }, { status: 500 });
    }
    jsonStr = jsonStr.slice(arrStart, arrEnd + 1);

    let questions;
    try { questions = JSON.parse(jsonStr); } catch {
      return NextResponse.json({ error: "Lỗi phân tích kết quả từ AI." }, { status: 500 });
    }

    const valid = questions.filter((q: { q: unknown; answers: unknown; correct: unknown }) =>
      q && typeof q.q === "string" &&
      Array.isArray(q.answers) && q.answers.length === 4 &&
      typeof q.correct === "number"
    );

    if (valid.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy câu hỏi trắc nghiệm hợp lệ trong file." }, { status: 400 });
    }

    return NextResponse.json({ questions: valid, count: valid.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    if (message.toLowerCase().includes("api key")) {
      return NextResponse.json({ error: "API key không hợp lệ hoặc hết quota." }, { status: 401 });
    }
    return NextResponse.json({ error: `Lỗi xử lý file: ${message}` }, { status: 500 });
  }
}
