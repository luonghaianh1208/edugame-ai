"use client";

import { useState } from "react";
import { Loader2, Sparkles, BookOpen, Target, ChevronDown } from "lucide-react";
import { TEMPLATES, TemplateId, TemplateInfo } from "@/lib/templates/types";

export interface GameParams {
  topic: string;
  templateId: TemplateId;
  questionCount: number;
  difficulty: string;
  useTimer: boolean;
  useScoring: boolean;
  rewardPenalty: "none" | "points" | "time" | "both";
}

interface InputPanelProps {
  onGenerate: (params: GameParams) => void;
  isGenerating: boolean;
}

const DIFFICULTIES = [
  { value: "easy",   label: "😊 Dễ",         color: "#3fb950" },
  { value: "medium", label: "🔥 Trung bình",  color: "#d29922" },
  { value: "hard",   label: "💀 Khó",          color: "#f85149" },
];

const Q_COUNTS = [5, 8, 10, 12, 15, 20];

export default function InputPanel({ onGenerate, isGenerating }: InputPanelProps) {
  const [topic,         setTopic]         = useState("");
  const [templateId,    setTemplateId]    = useState<TemplateId>("rpg-battle");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty,    setDifficulty]    = useState("medium");
  const [useTimer,      setUseTimer]      = useState(true);
  const [useScoring,    setUseScoring]    = useState(true);
  const [rewardPenalty, setRewardPenalty] = useState<"none"|"points"|"time"|"both">("points");
  const [showSettings,  setShowSettings]  = useState(false);

  const selected = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[7];

  function handleGenerate() {
    if (!topic.trim()) return;
    onGenerate({ topic: topic.trim(), templateId, questionCount, difficulty, useTimer, useScoring, rewardPenalty });
  }

  const canGenerate = topic.trim().length > 0 && !isGenerating;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} color="white" />
          </span>
          Tạo Game Mới
        </div>
        <span className="badge badge-blue" style={{ fontSize: 10 }}>
          <Sparkles size={9} /> AI Powered
        </span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 12px 16px" }}>

        {/* Topic */}
        <div className="form-group">
          <label className="form-label">
            <BookOpen size={11} /> CHỦ ĐỀ BÀI HỌC
          </label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Ví dụ: Quang hợp ở thực vật, Chiến tranh Việt Nam, Phương trình bậc 2..."
            rows={2}
            style={{
              width: "100%", padding: "9px 11px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--bg-tertiary)",
              color: "var(--text-primary)", fontSize: 13, resize: "none", outline: "none",
              fontFamily: "inherit", lineHeight: 1.5
            }}
          />
        </div>

        {/* Template gallery */}
        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label">
            <Target size={11} /> CHỌN TEMPLATE TRÒ CHƠI
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {TEMPLATES.map((t: TemplateInfo) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                style={{
                  padding: "9px 10px", borderRadius: 10,
                  border: `2px solid ${templateId === t.id ? "var(--accent-blue)" : "var(--border)"}`,
                  background: templateId === t.id ? "rgba(99,102,241,.12)" : "var(--bg-tertiary)",
                  cursor: "pointer", textAlign: "left", transition: "all .15s",
                  display: "flex", flexDirection: "column", gap: 3,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 16 }}>{t.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: templateId === t.id ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.2 }}>{t.name}</span>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>{t.desc}</div>
                <div style={{ fontSize: 9, color: templateId === t.id ? "var(--accent-blue)" : "var(--text-muted)", fontWeight: 600 }}>👥 {t.players}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Number of questions */}
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">📖 SỐ CÂU HỎI</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {Q_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                style={{
                  padding: "5px 12px", borderRadius: 7,
                  border: `1px solid ${questionCount === n ? "var(--accent-blue)" : "var(--border)"}`,
                  background: questionCount === n ? "rgba(99,102,241,.15)" : "var(--bg-tertiary)",
                  color: questionCount === n ? "var(--accent-blue)" : "var(--text-secondary)",
                  cursor: "pointer", fontSize: 12, fontWeight: questionCount === n ? 700 : 400,
                  transition: "all .12s",
                }}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">🎯 MỨC ĐỘ KHÓ</label>
          <div style={{ display: "flex", gap: 5 }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                style={{
                  flex: 1, padding: "7px 6px", borderRadius: 8, fontSize: 11, fontWeight: difficulty === d.value ? 700 : 400,
                  border: `1px solid ${difficulty === d.value ? d.color : "var(--border)"}`,
                  background: difficulty === d.value ? `${d.color}22` : "var(--bg-tertiary)",
                  color: difficulty === d.value ? d.color : "var(--text-muted)",
                  cursor: "pointer", transition: "all .12s",
                }}
              >{d.label}</button>
            ))}
          </div>
        </div>

        {/* Advanced settings */}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--bg-tertiary)", color: "var(--text-secondary)", cursor: "pointer",
              fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span>⚙️ CÀI ĐẶT NÂNG CAO</span>
            <ChevronDown size={12} style={{ transform: showSettings ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>

          {showSettings && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10, padding: "10px", background: "var(--bg-tertiary)", borderRadius: 8, border: "1px solid var(--border)" }}>
              {/* Timer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>⏱️ Bộ đếm thời gian</div>
                <button
                  onClick={() => setUseTimer(v => !v)}
                  style={{
                    width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                    background: useTimer ? "var(--accent-blue)" : "var(--border)", transition: "all .2s", position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: useTimer ? 18 : 3, width: 16, height: 16,
                    borderRadius: "50%", background: "white", transition: "left .2s",
                  }} />
                </button>
              </div>
              {/* Scoring */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>🏆 Tính điểm</div>
                <button
                  onClick={() => setUseScoring(v => !v)}
                  style={{
                    width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                    background: useScoring ? "var(--accent-blue)" : "var(--border)", transition: "all .2s", position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: useScoring ? 18 : 3, width: 16, height: 16,
                    borderRadius: "50%", background: "white", transition: "left .2s",
                  }} />
                </button>
              </div>
              {/* Reward */}
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 5 }}>🎁 THƯỞNG / PHẠT</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {(["none","points","time","both"] as const).map(v => {
                    const labels = { none: "🚫 Không", points: "⭐ Điểm", time: "⏱️ Thời gian", both: "🎁 Cả hai" };
                    return (
                      <button
                        key={v}
                        onClick={() => setRewardPenalty(v)}
                        style={{
                          padding: "5px 6px", borderRadius: 7, fontSize: 10, fontWeight: rewardPenalty === v ? 700 : 400,
                          border: `1px solid ${rewardPenalty === v ? "var(--accent-blue)" : "var(--border)"}`,
                          background: rewardPenalty === v ? "rgba(99,102,241,.15)" : "var(--bg-primary)",
                          color: rewardPenalty === v ? "var(--accent-blue)" : "var(--text-muted)",
                          cursor: "pointer", transition: "all .12s",
                        }}
                      >{labels[v]}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {topic.trim() && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(99,102,241,.08)", borderRadius: 9, border: "1px solid rgba(99,102,241,.25)", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: "var(--accent-blue)", marginBottom: 3 }}>PREVIEW YÊU CẦU</div>
            <div>🎮 {selected?.emoji} {selected?.name}</div>
            <div>📖 {topic.trim()}</div>
            <div>❓ {questionCount} câu · {DIFFICULTIES.find(d => d.value === difficulty)?.label}</div>
          </div>
        )}
      </div>

      {/* Generate button */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            width: "100%", padding: "12px", borderRadius: 10, border: "none",
            background: canGenerate
              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
              : "var(--bg-tertiary)",
            color: canGenerate ? "white" : "var(--text-muted)",
            fontSize: 14, fontWeight: 800, cursor: canGenerate ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
            boxShadow: canGenerate ? "0 4px 16px rgba(124,58,237,.4)" : "none",
          }}
        >
          {isGenerating ? (
            <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Đang tạo game...</>
          ) : (
            <><Sparkles size={15} /> Tạo Game với AI</>
          )}
        </button>
      </div>
    </div>
  );
}
