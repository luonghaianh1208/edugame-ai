export interface GameGeneratorParams {
  topic: string;
  gameType: string;
  questionCount: number;
  difficulty: string;
  useTimer: boolean;
  useScoring: boolean;
  rewardPenalty: "none" | "points" | "time" | "both";
  description?: string;
}

export function getGameGeneratorPrompt(params: GameGeneratorParams): string {
  const { topic, gameType, questionCount, difficulty, useTimer, useScoring, rewardPenalty, description } = params;

  const difficultyGuide = {
    easy: "cơ bản, trực tiếp, không đánh lừa – phù hợp học sinh mới học chủ đề này",
    medium: "kết hợp lý thuyết và ứng dụng thực tế, có câu hỏi đòi hỏi hiểu bản chất",
    hard: "phân tích sâu, suy luận nhiều bước, câu hỏi đặt trong ngữ cảnh phức tạp",
  }[difficulty] || "trung bình";

  // ── Mechanic decision guide per game type ──────────────────────────
  const mechanicGuide: Record<string, string> = {
    quiz: `
TIMER: Nếu useTimer=true → đếm ngược TỪNG CÂU (mặc định 20-30 giây tuỳ difficulty). Thanh progress timer đẹp.
SCORING: Mỗi câu đúng = 100 điểm base. Nếu trả lời nhanh (còn nhiều thời gian) → SPEED BONUS thêm 0-50 điểm.
REWARD/PENALTY điểm: đúng +100 (+speed bonus), sai -20 điểm (không âm).
REWARD/PENALTY thời gian: đúng +3 giây thêm, sai -5 giây bị trừ.
COMBO: Trả lời đúng liên tiếp 3+ lần → hiện "COMBO x3 🔥" và nhân đôi điểm tiếp theo.
UI: Nút A/B/C/D lớn, màu sắc, animation flip/shake khi trả lời.`,

    matching: `
TIMER: Nếu useTimer=true → đếm ngược TOÀN BỘ GAME (2-3 phút tuỳ số cặp). Áp lực thú vị hơn từng câu.
SCORING: Mỗi cặp ghép đúng ngay lần đầu = 100 điểm. Ghép sai rồi đúng = 50 điểm.
REWARD/PENALTY điểm: ghép đúng +100, ghép sai -10 điểm.
REWARD/PENALTY thời gian: ghép đúng +5 giây, ghép sai -8 giây.
COMBO: Ghép đúng 3 cặp liên tiếp = hiệu ứng confetti mini.
UI: Hai cột trái/phải. Khi chọn 1 item ở trái → highlight, click item phải → kéo dây nối. Đúng thì dây xanh, sai thì rung trước khi ẩn.`,

    memory: `
TIMER: Nếu useTimer=true → đếm ngược TOÀN BỘ (3-5 phút). Tạo áp lực nhớ nhanh.
SCORING: Tìm cặp đúng ngay lần đầu lật = 200 điểm, lần 2 = 100 điểm, lần 3+ = 50 điểm.
REWARD/PENALTY thời gian: tìm cặp đúng +10 giây, lật sai 3+ lần -5 giây.
COMBO: Tìm 2 cặp liên tiếp đúng ngay → "Memory Master!" +bonus.
UI: Lưới thẻ đẹp với animation 3D flip (rotateY). Mặt sau thẻ có hoa văn gradient. Mặt trước có content clear.`,

    crossword: `
TIMER: Nếu useTimer=true → đếm ngược TOÀN BỘ ô chữ (5-8 phút). Không timer từng ô.
SCORING: Hoàn thành 1 từ = 100 điểm. Hoàn thành 1 từ đầu tiên thử = 100, đã xem gợi ý = 50.
REWARD/PENALTY điểm: điền đúng 1 từ +100; nhấn "Gợi ý" bị trừ -20 điểm.
REWARD/PENALTY thời gian: điền đúng 1 từ +15 giây; nhấn xem đáp án -30 giây.
UI: Ô chữ grid styling đẹp, ô được đánh số, gợi ý hiển thị sidebar, ô đúng highlight xanh, sai đỏ.`,

    reaction: `
TIMER: Nếu useTimer=true → đếm ngược TOÀN BỘ (2-3 phút). Vừa sắp xếp vừa chạy đua.
SCORING: Sắp xếp đúng hoàn toàn lần đầu = 200 điểm. Sau khi thử lại = 100 điểm.
REWARD/PENALTY điểm: mỗi bước đúng trong chuỗi +20, sắp xếp sai thứ tự -30.
REWARD/PENALTY thời gian: hoàn thành chuỗi đúng +20 giây.
COMBO: Hoàn thành chuỗi đúng ngay lần đầu → "PERFECT! 🌟" +50 bonus.
UI: Các item hiển thị dạng cards có số thứ tự. Click chọn thứ tự 1→2→3. Animation slide khi xếp.`,

    wordsearch: `
TIMER: Nếu useTimer=true → đếm ngược TOÀN BỘ (4-6 phút tuỳ số từ).
SCORING: Tìm được 1 từ = 50 điểm. Tìm được trong vòng 30 giây đầu = 80 điểm (quick find bonus).
REWARD/PENALTY thời gian: tìm được từ +10 giây; nhấn "Hint" (highlight từ đầu tiên) -20 giây.
UI: Bảng chữ cái 10x10 hoặc 12x12. Click chữ đầu rồi drag đến chữ cuối để chọn từ. Từ tìm được gạch màu. Danh sách từ cần tìm ở bên cạnh, đánh dấu ✓ khi tìm được.`,

    fillblank: `
TIMER: Nếu useTimer=true → đếm ngược TỪNG CÂU (15-25 giây tuỳ difficulty).
SCORING: Điền đúng = 100 điểm + speed bonus. Dùng gợi ý = 50 điểm tối đa.
REWARD/PENALTY điểm: đúng +100, sai 1 lần -20, sai 2 lần → hiện đáp án -30 nữa.
REWARD/PENALTY thời gian: đúng +5 giây; sai tốc độ timer tăng nhanh hơn (pressure!).
COMBO: Điền đúng liên tiếp → hiệu ứng fire streak.
UI: Câu văn với ô trống nổi bật. Có thể hiển thị dạng chọn từ (word bank) HOẶC gõ tự do tuỳ difficulty.`,

    truefalse: `
TIMER: Nếu useTimer=true → đếm ngược TỪNG CÂU rất nhanh (8-12 giây). Tạo áp lực quyết định nhanh!
SCORING: Đúng trong 5 giây đầu = 150 điểm (lightning round!), 5-10 giây = 100 điểm, gần hết = 50 điểm.
REWARD/PENALTY điểm: đúng +100-150, sai -30 điểm.
REWARD/PENALTY thời gian: đúng +3 giây, sai -5 giây.
COMBO: Đúng liên tiếp được nhân điểm (x1.5 sau 3, x2 sau 5).
UI: Nút ĐÚng/SAI to, màu xanh/đỏ, animation mạnh khi click. Timer bar chạy nhanh tạo cảm giác hồi hộp.`,
  };

  const mechanic = mechanicGuide[gameType] || mechanicGuide.quiz;

  // ── Build mechanics instruction block ─────────────────────────────
  const timerSection = useTimer
    ? `✅ CÓ BẤM GIỜ: Triển khai theo hướng dẫn game type ở trên.`
    : `❌ KHÔNG BẤM GIỜ: Bỏ qua timer. Vẫn có thể hiện thời gian đã chơi (đếm lên) để tham khảo.`;

  const scoringSection = useScoring
    ? `✅ CÓ TÍNH ĐIỂM: Triển khai đầy đủ theo hướng dẫn. Hiển thị điểm realtime ở header.`
    : `❌ KHÔNG TÍNH ĐIỂM: Chỉ hiển thị kết quả đúng/sai. Không cần panel điểm.`;

  const rewardSection = (() => {
    if (rewardPenalty === "none") return `❌ KHÔNG THƯỞNG/PHẠT: Chơi thoải mái, không mất/được thêm gì.`;
    if (rewardPenalty === "points") return `⭐ THƯỞNG/PHẠT ĐIỂM: Đúng +điểm bonus, sai -điểm theo hướng dẫn. Triển khai COMBO STREAK.`;
    if (rewardPenalty === "time") return `⏱️ THƯỞNG/PHẠT THỜI GIAN: Đúng +giây, sai -giây theo hướng dẫn.`;
    return `🎁 THƯỞNG/PHẠT CẢ HAI: Kết hợp điểm VÀ thời gian. AI tự cân bằng cho hợp lý.`;
  })();

  return `Bạn là EDUGAME AI – chuyên gia thiết kế trò chơi học tập tương tác bậc thầy cho giáo viên Việt Nam.
Nhiệm vụ: Tạo ra trò chơi HTML đẹp, hấp dẫn, logic chính xác, khiến học sinh PHÊ khi chơi.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YÊU CẦU GAME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Chủ đề: ${topic}
- Loại game: ${gameType}
- Số câu/cặp: ${questionCount}
- Độ khó: ${difficultyGuide}
${description ? `- Ghi chú thêm: ${description}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ CƠ CHẾ GAME (đọc kỹ và triển khai đúng)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${mechanic}

${timerSection}
${scoringSection}
${rewardSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 YÊU CẦU THIẾT KẾ (BẮT BUỘC XUẤT SẮC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Visual Design – phải WOW ngay khi nhìn
- Màu nền: KHÔNG dùng màu trắng/xám đơn điệu. Dùng gradient đậm (ví dụ: #1a1a2e → #16213e → #0f3460) hoặc gradient sáng-tím (#667eea → #764ba2).
- Có thể có: particles nền, hiệu ứng glow, pulsing background elements.
- Font: Google Fonts không được dùng. Dùng system fonts đẹp: 'Segoe UI', Arial Rounded, sans-serif. Size đủ lớn.
- Card/button: bo tròn corner-radius >12px, box-shadow depth, gradient fill, hover scale transform.
- Icon: Dùng emoji trong code trực tiếp (không cần icon library).

### Animations (PHẢI CÓ)
- Entrance animation: fade-in + slide-up khi game load.
- Correct answer: confetti/particle burst / bounce / glow xanh.
- Wrong answer: shake / flash đỏ / "💥 Sai rồi!".
- Timer sắp hết: timer bar đổi màu đỏ và pulse.
- Score change: số điểm animated +100 bay lên rồi biến.
- COMBO: fire effect + số nhân điểm hiện to.
- Kết thúc game: màn hình kết quả ấn tượng với animated stars/confetti.

### Audio (dùng Web Audio API – không CDN)
${useTimer ? "- Tick sound khi timer sắp hết (last 5 giây)." : ""}
- Correct: sound sinh từ AudioContext (beep tần số cao dễ chịu).
- Wrong: sound thấp/buồn.
- Game over / complete: melody ngắn vui vẻ.
- Tất cả âm thanh generate bằng Web Audio API inline – không file bên ngoài!

### Màn hình & Flow
1. INTRO SCREEN: Logo game + chủ đề + nút "Bắt đầu ▶". Có animation chờ đẹp.
2. GAME SCREEN: Layout rõ ràng với header (điểm, timer, progress, combo).
3. RESULT SCREEN: Điểm tổng, xếp hạng sao (1-3 ⭐), thống kê, nút "Chơi lại" và "Chia sẻ".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 YÊU CẦU NỘI DUNG (BẮT BUỘC CHÍNH XÁC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Tạo đúng ${questionCount} câu hỏi/item về "${topic}" với độ khó ${difficulty}.
- Nội dung CHÍNH XÁC về mặt khoa học/kiến thức – đây là game dạy học!
- Đa dạng câu hỏi: không lặp lại kiểu hỏi, bao phủ nhiều khía cạnh khác nhau của chủ đề.
- Tiếng Việt là chính. Thuật ngữ khoa học có thể giữ tiếng Anh/Latin nếu cần.
- Có giải thích ngắn khi trả lời sai (1 câu) để học sinh học được điều gì đó.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 QUY TẮC TECHNICAL (KHÔNG VI PHẠM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 1 file HTML duy nhất: <!DOCTYPE html> ... </html>
- CSS embedded trong <style> – KHÔNG CDN, KHÔNG @import từ URL
- JS embedded trong <script> – KHÔNG CDN, KHÔNG fetch/API call bên ngoài  
- Web Audio API cho sound (không cần file âm thanh)
- Responsive: hoạt động Desktop và Mobile
- Không lỗi JavaScript – dùng try/catch cho Web Audio
- Data câu hỏi hardcode trong JS const/array

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 FORMAT OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trả về CHỈ code HTML. Bắt đầu bằng <!DOCTYPE html>, kết thúc bằng </html>.
KHÔNG markdown, KHÔNG giải thích, KHÔNG backtick. Chỉ HTML thuần.`;
}
