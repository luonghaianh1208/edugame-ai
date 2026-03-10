"use client";

import { useState } from "react";
import { Zap, BookOpen, Target, Clock, AlignLeft, ChevronDown, Loader2, Sparkles } from "lucide-react";

const GAME_TYPES = [
  { value: "quiz", label: "🎯 Trắc nghiệm (Quiz)", desc: "4 đáp án, timer, điểm số" },
  { value: "matching", label: "🔗 Ghép cặp (Matching)", desc: "Click để ghép thuật ngữ" },
  { value: "memory", label: "🃏 Lật thẻ (Memory Card)", desc: "Tìm cặp thẻ giống nhau" },
  { value: "crossword", label: "🔤 Ô chữ (Crossword)", desc: "Điền vào ô chữ" },
  { value: "reaction", label: "⛓️ Sắp xếp thứ tự", desc: "Sắp xếp chuỗi đúng thứ tự" },
];

const DIFFICULTIES = [
  { value: "easy", label: "😊 Dễ", color: "#3fb950" },
  { value: "medium", label: "🔥 Trung bình", color: "#d29922" },
  { value: "hard", label: "💀 Khó", color: "#f85149" },
];

interface InputPanelProps {
  onGenerate: (params: {
    topic: string; gameType: string; questionCount: number;
    difficulty: string; timePerQuestion?: number; description?: string;
  }) => void;
  isGenerating: boolean;
}

export default function InputPanel({ onGenerate, isGenerating }: InputPanelProps) {
  const [topic, setTopic] = useState("");
  const [gameType, setGameType] = useState("quiz");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [timePerQuestion, setTimePerQuestion] = useState<number | undefined>(20);
  const [useTimer, setUseTimer] = useState(true);
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic: topic.trim(), gameType, questionCount, difficulty, timePerQuestion: useTimer ? timePerQuestion : undefined, description: description.trim() || undefined });
  }

  const selectedGame = GAME_TYPES.find(g => g.value === gameType);
  const selectedDiff = DIFFICULTIES.find(d => d.value === difficulty);

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
        style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}
      >
        {/* Topic */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
            <BookOpen size={13} /> CHỦ ĐỀ BÀI HỌC *
          </label>
          <textarea
            className="input-field"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Ví dụ: phản ứng oxi hóa khử, phương trình bậc hai, chiến tranh thế giới thứ 2..."
            rows={3}
            style={{ resize: "vertical", minHeight: 72 }}
            required
          />
        </div>

        {/* Game Type */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
            <Target size={13} /> LOẠI TRÒ CHƠI *
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {GAME_TYPES.map(gt => (
              <label
                key={gt.value}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  borderRadius: 8, cursor: "pointer",
                  background: gameType === gt.value ? "rgba(56,139,253,0.1)" : "var(--bg-tertiary)",
                  border: `1px solid ${gameType === gt.value ? "rgba(56,139,253,0.5)" : "var(--border)"}`,
                  transition: "all 0.2s",
                }}
              >
                <input type="radio" name="gameType" value={gt.value} checked={gameType === gt.value}
                  onChange={e => setGameType(e.target.value)} style={{ display: "none" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: gameType === gt.value ? "var(--accent-blue)" : "var(--text-primary)", flex: 1 }}>
                  {gt.label}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{gt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question Count + Difficulty */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
              SỐ CÂU HỎI
            </label>
            <select className="input-field" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}>
              {[5, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n} câu</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
              MỨC ĐỘ KHÓ
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value} type="button"
                  onClick={() => setDifficulty(d.value)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", border: `1px solid ${difficulty === d.value ? d.color : "var(--border)"}`,
                    background: difficulty === d.value ? `${d.color}22` : "var(--bg-tertiary)",
                    color: difficulty === d.value ? d.color : "var(--text-muted)",
                    transition: "all 0.2s",
                  }}
                >
                  {d.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timer toggle */}
        {(gameType === "quiz") && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", background: "var(--bg-tertiary)",
            borderRadius: 8, border: "1px solid var(--border)",
          }}>
            <Clock size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: 13, flex: 1, color: "var(--text-primary)" }}>Đếm ngược thời gian</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => setUseTimer(!useTimer)}
                style={{
                  width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                  background: useTimer ? "var(--accent-blue)" : "var(--border)",
                  position: "relative", transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute", top: 3, left: useTimer ? 20 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "white",
                  transition: "left 0.2s",
                }} />
              </button>
              {useTimer && (
                <input
                  type="number"
                  className="input-field"
                  value={timePerQuestion}
                  onChange={e => setTimePerQuestion(Number(e.target.value))}
                  min={5} max={120}
                  style={{ width: 64, textAlign: "center" }}
                />
              )}
              {useTimer && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>giây</span>}
            </div>
          </div>
        )}

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600,
            padding: "4px 0",
          }}
        >
          <ChevronDown size={14} style={{ transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          <AlignLeft size={13} />
          {showAdvanced ? "Ẩn" : "Mô tả thêm (tùy chọn)"}
        </button>

        {showAdvanced && (
          <div className="fade-in">
            <textarea
              className="input-field"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả thêm yêu cầu đặc biệt: hiệu ứng, luật chơi, phong cách, v.v..."
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
        )}

        {/* Selected summary */}
        {topic && (
          <div className="glass-card fade-in" style={{
            padding: "10px 14px", fontSize: 12,
            borderColor: "rgba(56,139,253,0.2)",
          }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>Preview yêu cầu:</div>
            <div style={{ color: "var(--text-primary)" }}>
              {selectedGame?.label} về <strong>"{topic}"</strong> — {questionCount} câu, {selectedDiff?.label}
              {useTimer && gameType === "quiz" && `, ${timePerQuestion}s/câu`}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          type="submit"
          className="btn-glow"
          disabled={isGenerating || !topic.trim()}
          style={{ padding: "13px", fontSize: 15, borderRadius: 10, marginTop: 4 }}
        >
          {isGenerating ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <Loader2 size={16} className="spinner" style={{ animation: "spin 0.8s linear infinite", border: "none" }} />
              AI đang tạo game...
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
