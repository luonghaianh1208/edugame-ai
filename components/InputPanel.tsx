"use client";

import { useState } from "react";
import { Zap, BookOpen, Target, AlignLeft, ChevronDown, Loader2, Sparkles, Timer, Star, Gift, Flame } from "lucide-react";

const GAME_TYPES = [
  { value: "quiz", label: "🎯 Trắc nghiệm", desc: "4 đáp án, timer, điểm số" },
  { value: "matching", label: "🔗 Ghép cặp", desc: "Click ghép thuật ngữ - định nghĩa" },
  { value: "memory", label: "🃏 Lật thẻ nhớ", desc: "Tìm cặp thẻ giống nhau" },
  { value: "crossword", label: "🔤 Ô chữ", desc: "Điền từ vào ô chữ" },
  { value: "reaction", label: "⛓️ Sắp xếp thứ tự", desc: "Click chọn đúng thứ tự" },
  { value: "wordsearch", label: "🔍 Tìm từ ẩn", desc: "Tìm từ trong bảng chữ cái" },
  { value: "fillblank", label: "✏️ Điền vào chỗ trống", desc: "Chọn/gõ từ còn thiếu" },
  { value: "truefalse", label: "✅ Đúng hay Sai", desc: "Nhanh tay quyết định đúng/sai" },
];

const DIFFICULTIES = [
  { value: "easy", label: "😊 Dễ", color: "#3fb950" },
  { value: "medium", label: "🔥 Trung bình", color: "#d29922" },
  { value: "hard", label: "💀 Khó", color: "#f85149" },
];

export interface GameParams {
  topic: string;
  gameType: string;
  questionCount: number;
  difficulty: string;
  useTimer: boolean;
  useScoring: boolean;
  rewardPenalty: "none" | "points" | "time" | "both";
  description?: string;
}

interface InputPanelProps {
  onGenerate: (params: GameParams) => void;
  isGenerating: boolean;
}

export default function InputPanel({ onGenerate, isGenerating }: InputPanelProps) {
  const [topic, setTopic] = useState("");
  const [gameType, setGameType] = useState("quiz");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [useTimer, setUseTimer] = useState(true);
  const [useScoring, setUseScoring] = useState(true);
  const [rewardPenalty, setRewardPenalty] = useState<"none" | "points" | "time" | "both">("points");
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({
      topic: topic.trim(), gameType, questionCount, difficulty,
      useTimer, useScoring, rewardPenalty,
      description: description.trim() || undefined,
    });
  }

  const selectedGame = GAME_TYPES.find(g => g.value === gameType);
  const selectedDiff = DIFFICULTIES.find(d => d.value === difficulty);

  // Toggle helper
  const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled?: boolean }) => (
    <button type="button" onClick={onChange} disabled={disabled}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: value ? "var(--accent-blue)" : "var(--border)",
        position: "relative", transition: "background 0.2s", flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: value ? 20 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "white",
        transition: "left 0.2s",
      }} />
    </button>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-secondary)" }}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #1f6feb, #388bfd)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={14} color="white" />
          </span>
          Tạo Game Mới
        </div>
        <span className="badge badge-blue">AI Powered</span>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="scroll-area"
        style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 13, overflowY: "auto" }}
      >
        {/* Topic */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.05em" }}>
            <BookOpen size={12} /> CHỦ ĐỀ BÀI HỌC *
          </label>
          <textarea
            className="input-field"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Ví dụ: phản ứng oxi hóa khử, phương trình bậc hai, chiến tranh thế giới thứ 2..."
            rows={3}
            style={{ resize: "vertical", minHeight: 72, fontSize: 13 }}
            required
          />
        </div>

        {/* Game Type */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.05em" }}>
            <Target size={12} /> LOẠI TRÒ CHƠI *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {GAME_TYPES.map(gt => (
              <label
                key={gt.value}
                style={{
                  display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px",
                  borderRadius: 8, cursor: "pointer",
                  background: gameType === gt.value ? "rgba(56,139,253,0.12)" : "var(--bg-tertiary)",
                  border: `1px solid ${gameType === gt.value ? "rgba(56,139,253,0.5)" : "var(--border)"}`,
                  transition: "all 0.15s",
                }}
              >
                <input type="radio" name="gameType" value={gt.value} checked={gameType === gt.value}
                  onChange={e => setGameType(e.target.value)} style={{ display: "none" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: gameType === gt.value ? "var(--accent-blue)" : "var(--text-primary)" }}>
                  {gt.label}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>{gt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Count + Difficulty */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.05em" }}>
              SỐ CÂU / CẶP
            </label>
            <select className="input-field" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} style={{ fontSize: 13 }}>
              {[5, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.05em" }}>
              MỨC ĐỘ KHÓ
            </label>
            <div style={{ display: "flex", gap: 4 }}>
              {DIFFICULTIES.map(d => (
                <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                  style={{
                    flex: 1, padding: "7px 2px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", border: `1px solid ${difficulty === d.value ? d.color : "var(--border)"}`,
                    background: difficulty === d.value ? `${d.color}22` : "var(--bg-tertiary)",
                    color: difficulty === d.value ? d.color : "var(--text-muted)", transition: "all 0.15s",
                  }}
                >
                  {d.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== GAME MECHANICS SECTION ===== */}
        <div style={{
          background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--border)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "rgba(56,139,253,0.05)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", letterSpacing: "0.05em" }}>
              ⚙️ CƠ CHẾ TRÒ CHƠI
            </span>
          </div>

          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Timer toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: useTimer ? "rgba(56,139,253,0.15)" : "var(--bg-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${useTimer ? "rgba(56,139,253,0.3)" : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
                <Timer size={13} color={useTimer ? "var(--accent-blue)" : "var(--text-muted)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>Bấm giờ</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {useTimer ? "AI tự chọn: theo câu hoặc toàn game" : "Không giới hạn thời gian"}
                </div>
              </div>
              <Toggle value={useTimer} onChange={() => setUseTimer(!useTimer)} />
            </div>

            {/* Scoring toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: useScoring ? "rgba(210,153,34,0.15)" : "var(--bg-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${useScoring ? "rgba(210,153,34,0.3)" : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
                <Star size={13} color={useScoring ? "var(--accent-orange)" : "var(--text-muted)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>Tính điểm</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {useScoring ? "AI tự thiết kế hệ thống điểm" : "Không tính điểm"}
                </div>
              </div>
              <Toggle value={useScoring} onChange={() => setUseScoring(!useScoring)} />
            </div>

            {/* Reward/Penalty */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0, marginTop: 1,
                background: rewardPenalty !== "none" ? "rgba(163,113,247,0.15)" : "var(--bg-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${rewardPenalty !== "none" ? "rgba(163,113,247,0.3)" : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
                <Gift size={13} color={rewardPenalty !== "none" ? "#a371f7" : "var(--text-muted)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, marginBottom: 6 }}>Thưởng / Phạt</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {[
                    { value: "none", label: "🚫 Không" },
                    { value: "points", label: "⭐ Điểm" },
                    { value: "time", label: "⏱️ Thời gian" },
                    { value: "both", label: "🎁 Cả hai" },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setRewardPenalty(opt.value as typeof rewardPenalty)}
                      disabled={!useScoring && (opt.value === "points" || opt.value === "both")}
                      style={{
                        padding: "5px 6px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        border: `1px solid ${rewardPenalty === opt.value ? "rgba(163,113,247,0.6)" : "var(--border)"}`,
                        background: rewardPenalty === opt.value ? "rgba(163,113,247,0.15)" : "var(--bg-tertiary)",
                        color: rewardPenalty === opt.value ? "#a371f7" : "var(--text-muted)",
                        opacity: (!useScoring && (opt.value === "points" || opt.value === "both")) ? 0.4 : 1,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4 }}>
                  {rewardPenalty === "points" && "Trả lời đúng +điểm, sai -điểm"}
                  {rewardPenalty === "time" && "Đúng+thêm giờ, sai-bớt giờ"}
                  {rewardPenalty === "both" && "AI kết hợp cả điểm lẫn thời gian"}
                  {rewardPenalty === "none" && "Không có phần thưởng hay hình phạt"}
                </div>
              </div>
            </div>

            {/* Combo/streak hint */}
            {useScoring && rewardPenalty !== "none" && (
              <div className="fade-in" style={{
                padding: "6px 10px", borderRadius: 7, fontSize: 11, color: "#a371f7",
                background: "rgba(163,113,247,0.08)", border: "1px solid rgba(163,113,247,0.2)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Flame size={12} /> AI sẽ thêm combo streak & hiệu ứng khi trả lời liên tiếp đúng
              </div>
            )}
          </div>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: "flex", alignItems: "center", gap: 7, background: "none", border: "none",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "2px 0",
          }}
        >
          <ChevronDown size={13} style={{ transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          <AlignLeft size={12} />
          {showAdvanced ? "Ẩn" : "Mô tả bổ sung (tùy chọn)"}
        </button>

        {showAdvanced && (
          <div className="fade-in">
            <textarea
              className="input-field"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Phong cách, màu sắc, âm nhạc nền, nhân vật, yêu cầu đặc biệt..."
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
        )}

        {/* Preview summary */}
        {topic && (
          <div className="glass-card fade-in" style={{ padding: "10px 13px", fontSize: 12, borderColor: "rgba(56,139,253,0.2)" }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600, fontSize: 11 }}>PREVIEW YÊU CẦU:</div>
            <div style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>
              {selectedGame?.label} về <strong>"{topic}"</strong><br />
              {questionCount} câu · {selectedDiff?.label}
              {useTimer && " · ⏱️ Bấm giờ"}
              {useScoring && " · ⭐ Tính điểm"}
              {rewardPenalty !== "none" && ` · 🎁 Thưởng/phạt ${rewardPenalty}`}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          type="submit"
          className="btn-glow"
          disabled={isGenerating || !topic.trim()}
          style={{ padding: "13px", fontSize: 15, borderRadius: 10 }}
        >
          {isGenerating ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
              AI đang thiết kế game...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <Sparkles size={16} /> Tạo Game với AI ✨
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
