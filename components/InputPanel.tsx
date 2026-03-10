"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, BookOpen, Target, AlignLeft, ChevronDown, Loader2, Sparkles, Timer, Star, Gift, Flame, PenLine } from "lucide-react";

const PRESET_GAME_TYPES = [
  { value: "quiz",       label: "🎯 Trắc nghiệm",    desc: "4 đáp án, timer, điểm số" },
  { value: "matching",   label: "🔗 Ghép cặp",        desc: "Nối thuật ngữ - định nghĩa" },
  { value: "memory",     label: "🃏 Lật thẻ nhớ",     desc: "Tìm cặp thẻ giống nhau" },
  { value: "crossword",  label: "🔤 Ô chữ",           desc: "Điền từ vào ô chữ" },
  { value: "reaction",   label: "⛓️ Sắp xếp thứ tự", desc: "Đặt item đúng thứ tự" },
  { value: "wordsearch", label: "🔍 Tìm từ ẩn",       desc: "Tìm từ trong bảng chữ" },
  { value: "fillblank",  label: "✏️ Điền chỗ trống",  desc: "Chọn/gõ từ còn thiếu" },
  { value: "truefalse",  label: "✅ Đúng hay Sai",    desc: "Nhanh tay quyết định" },
  { value: "custom",     label: "🎨 Tự định nghĩa",   desc: "Mô tả loại game bạn muốn" },
];

const DIFFICULTIES = [
  { value: "easy",   label: "😊 Dễ",        color: "#3fb950" },
  { value: "medium", label: "🔥 Trung bình", color: "#d29922" },
  { value: "hard",   label: "💀 Khó",        color: "#f85149" },
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
  const [topic,         setTopic]         = useState("");
  const [gameType,      setGameType]      = useState("quiz");
  const [customGameDesc,setCustomGameDesc] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty,    setDifficulty]    = useState("medium");
  const [useTimer,      setUseTimer]      = useState(true);
  const [useScoring,    setUseScoring]    = useState(true);
  const [rewardPenalty, setRewardPenalty] = useState<"none"|"points"|"time"|"both">("points");
  const [description,   setDescription]  = useState("");
  const [showAdvanced,  setShowAdvanced]  = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(45);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.offsetHeight));
    ro.observe(el);
    setHeaderH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const isCustom = gameType === "custom";


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    if (isCustom && !customGameDesc.trim()) return;

    // For custom game type, merge the custom description into the description field
    const finalGameType = isCustom ? "custom" : gameType;
    const finalDesc = isCustom
      ? `[LOẠI GAME TỰ ĐỊNH NGHĨA] ${customGameDesc.trim()}${description.trim() ? "\n" + description.trim() : ""}`
      : description.trim() || undefined;

    onGenerate({
      topic: topic.trim(), gameType: finalGameType, questionCount, difficulty,
      useTimer, useScoring, rewardPenalty, description: finalDesc,
    });
  }

  const selectedGame = PRESET_GAME_TYPES.find(g => g.value === gameType);
  const selectedDiff = DIFFICULTIES.find(d => d.value === difficulty);

  const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled?: boolean }) => (
    <button type="button" onClick={onChange} disabled={disabled}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: value ? "var(--accent-blue)" : "var(--border)",
        position: "relative", transition: "background 0.2s", flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: value ? 20 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s",
      }} />
    </button>
  );

  return (
    /* Outer: fills the parent flex cell completely */
    <div style={{ position: "relative", width: "100%", height: "100%", background: "var(--bg-secondary)", overflow: "hidden" }}>

      {/* ── Sticky Header (absolutely positioned at top) ── */}
      <div ref={headerRef} className="panel-header" style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, borderRadius: "12px 12px 0 0" }}>
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

      {/* ── Scrollable Form (absolutely fills space below header) ── */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: "absolute",
          top: headerH,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 13,
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        {/* ── Topic ── */}
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

        {/* ── Game Type Grid ── */}
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.05em" }}>
            <Target size={12} /> LOẠI TRÒ CHƠI *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {PRESET_GAME_TYPES.map(gt => {
              const isSelected = gameType === gt.value;
              const isCustomCard = gt.value === "custom";
              return (
                <label
                  key={gt.value}
                  style={{
                    display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px",
                    borderRadius: 8, cursor: "pointer",
                    background: isSelected
                      ? isCustomCard ? "rgba(163,113,247,0.12)" : "rgba(56,139,253,0.12)"
                      : "var(--bg-tertiary)",
                    border: `1px solid ${isSelected
                      ? isCustomCard ? "rgba(163,113,247,0.5)" : "rgba(56,139,253,0.5)"
                      : "var(--border)"}`,
                    transition: "all 0.15s",
                    gridColumn: isCustomCard ? "1 / -1" : "auto",  /* custom spans full width */
                  }}
                >
                  <input type="radio" name="gameType" value={gt.value} checked={isSelected}
                    onChange={e => setGameType(e.target.value)} style={{ display: "none" }} />
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: isSelected
                      ? isCustomCard ? "#a371f7" : "var(--accent-blue)"
                      : "var(--text-primary)",
                  }}>
                    {gt.label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>{gt.desc}</span>
                </label>
              );
            })}
          </div>

          {/* ── Custom game type description (shown when "Tự định nghĩa" selected) ── */}
          {isCustom && (
            <div className="fade-in" style={{ marginTop: 8 }}>
              <div style={{
                padding: "8px 10px 4px",
                borderRadius: "8px 8px 0 0",
                background: "rgba(163,113,247,0.1)",
                border: "1px solid rgba(163,113,247,0.3)",
                borderBottom: "none",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <PenLine size={11} color="#a371f7" />
                <span style={{ fontSize: 11, color: "#a371f7", fontWeight: 700 }}>
                  MÔ TẢ LUẬT CHƠI *
                </span>
              </div>
              <textarea
                className="input-field"
                value={customGameDesc}
                onChange={e => setCustomGameDesc(e.target.value)}
                placeholder={`Ví dụ: "Game đuổi hình bắt chữ - AI tạo mô tả ngắn về 1 khái niệm, người chơi đoán tên. Mỗi lượt có 3 gợi ý tiết lộ dần. Đoán đúng ở gợi ý 1 = 100đ, gợi ý 2 = 60đ, gợi ý 3 = 30đ."`}
                rows={4}
                required={isCustom}
                style={{
                  resize: "vertical", fontSize: 12,
                  borderRadius: "0 0 8px 8px",
                  borderTop: "1px solid rgba(163,113,247,0.2)",
                  background: "rgba(163,113,247,0.05)",
                }}
              />
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                💡 Mô tả càng chi tiết, AI càng tạo đúng ý bạn. Bao gồm: cách chơi, cách tính điểm, luật đặc biệt.
              </div>
            </div>
          )}
        </div>

        {/* ── Count + Difficulty ── */}
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

        {/* ── Game Mechanics Section ── */}
        <div style={{ background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "rgba(56,139,253,0.05)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", letterSpacing: "0.05em" }}>
              ⚙️ CƠ CHẾ TRÒ CHƠI
            </span>
          </div>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Timer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: useTimer ? "rgba(56,139,253,0.15)" : "var(--bg-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${useTimer ? "rgba(56,139,253,0.3)" : "var(--border)"}`, transition: "all 0.2s",
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

            {/* Scoring */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: useScoring ? "rgba(210,153,34,0.15)" : "var(--bg-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${useScoring ? "rgba(210,153,34,0.3)" : "var(--border)"}`, transition: "all 0.2s",
              }}>
                <Star size={13} color={useScoring ? "var(--accent-orange)" : "var(--text-muted)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>Tính điểm</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {useScoring ? "AI thiết kế hệ thống điểm" : "Không tính điểm"}
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
                border: `1px solid ${rewardPenalty !== "none" ? "rgba(163,113,247,0.3)" : "var(--border)"}`, transition: "all 0.2s",
              }}>
                <Gift size={13} color={rewardPenalty !== "none" ? "#a371f7" : "var(--text-muted)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, marginBottom: 6 }}>Thưởng / Phạt</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {[
                    { value: "none",   label: "🚫 Không" },
                    { value: "points", label: "⭐ Điểm" },
                    { value: "time",   label: "⏱️ Thời gian" },
                    { value: "both",   label: "🎁 Cả hai" },
                  ].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setRewardPenalty(opt.value as typeof rewardPenalty)}
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
                  {rewardPenalty === "time"   && "Đúng+thêm giờ, sai-bớt giờ"}
                  {rewardPenalty === "both"   && "AI kết hợp cả điểm lẫn thời gian"}
                  {rewardPenalty === "none"   && "Không có phần thưởng hay hình phạt"}
                </div>
              </div>
            </div>

            {/* Combo hint */}
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

        {/* ── Advanced: extra description for any game type ── */}
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: "flex", alignItems: "center", gap: 7, background: "none", border: "none",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "2px 0",
          }}
        >
          <ChevronDown size={13} style={{ transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          <AlignLeft size={12} />
          {showAdvanced ? "Ẩn ghi chú" : "Ghi chú thêm (tuỳ chọn)"}
        </button>

        {showAdvanced && (
          <div className="fade-in">
            <textarea
              className="input-field"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Phong cách, nhân vật, yêu cầu đặc biệt, màu sắc chủ đề..."
              rows={3}
              style={{ resize: "vertical", fontSize: 13 }}
            />
          </div>
        )}

        {/* ── Preview summary ── */}
        {topic && (
          <div className="glass-card fade-in" style={{ padding: "10px 13px", fontSize: 12, borderColor: "rgba(56,139,253,0.2)" }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600, fontSize: 11 }}>PREVIEW YÊU CẦU:</div>
            <div style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>
              {selectedGame?.label} về <strong>&quot;{topic}&quot;</strong><br />
              {questionCount} câu · {selectedDiff?.label}
              {useTimer    && " · ⏱️ Bấm giờ"}
              {useScoring  && " · ⭐ Tính điểm"}
              {rewardPenalty !== "none" && ` · 🎁 ${rewardPenalty}`}
            </div>
          </div>
        )}

        {/* ── Generate button ── */}
        <button
          type="submit"
          className="btn-glow"
          disabled={isGenerating || !topic.trim() || (isCustom && !customGameDesc.trim())}
          style={{ padding: "13px", fontSize: 15, borderRadius: 10, flexShrink: 0 }}
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

        {/* bottom breathing room */}
        <div style={{ height: 8, flexShrink: 0 }} />
      </form>
    </div>
  );
}
