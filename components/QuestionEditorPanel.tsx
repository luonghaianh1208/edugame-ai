"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, Edit3, Check, X, Upload, Download,
  RefreshCw, Users, ChevronDown, ChevronUp
} from "lucide-react";
import { GameQuestion, GameSettings, TemplateId, TEMPLATES } from "@/lib/templates/types";

export interface EditorSettings {
  templateId: TemplateId;
  playerMode: "1p" | "2p" | "3p" | "4p";
  player1Name: string;
  player2Name: string;
  player3Name: string;
  player4Name: string;
}

interface QuestionEditorPanelProps {
  questions: GameQuestion[];
  editorSettings: EditorSettings;
  isApplying: boolean;
  onApply: (questions: GameQuestion[], settings: EditorSettings) => void;
  onSettingsChange: (settings: EditorSettings) => void;
}

const ANSWER_LABELS = ["A", "B", "C", "D"];

function QuestionCard({
  q, idx, onUpdate, onDelete,
}: {
  q: GameQuestion;
  idx: number;
  onUpdate: (q: GameQuestion) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<GameQuestion>({ ...q });

  function save() {
    onUpdate(draft);
    setEditing(false);
    setExpanded(false);
  }

  function cancel() {
    setDraft({ ...q });
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{
        background: "rgba(99,102,241,.08)", borderRadius: 10,
        border: "1px solid rgba(99,102,241,.35)", padding: "10px",
      }}>
        <div style={{ fontSize: 10, color: "var(--accent-blue)", fontWeight: 700, marginBottom: 6 }}>
          CÂU {idx + 1} — ĐANG CHỈNH SỬA
        </div>
        <textarea
          value={draft.q}
          onChange={e => setDraft(d => ({ ...d, q: e.target.value }))}
          rows={2}
          style={{
            width: "100%", padding: "7px 9px", borderRadius: 7,
            border: "1px solid rgba(99,102,241,.4)", background: "var(--bg-primary)",
            color: "var(--text-primary)", fontSize: 12, resize: "none",
            outline: "none", fontFamily: "inherit", lineHeight: 1.5, marginBottom: 8,
          }}
        />
        {draft.answers.map((ans, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5, alignItems: "center" }}>
            <button
              onClick={() => setDraft(d => ({ ...d, correct: i }))}
              style={{
                width: 22, height: 22, borderRadius: "50%", border: "none",
                background: draft.correct === i ? "#10b981" : "rgba(255,255,255,.1)",
                cursor: "pointer", flexShrink: 0, fontSize: 10,
                color: draft.correct === i ? "white" : "var(--text-muted)",
                fontWeight: 700,
              }}
              title="Đặt làm đáp án đúng"
            >{ANSWER_LABELS[i]}</button>
            <input
              value={ans}
              onChange={e => {
                const a = [...draft.answers];
                a[i] = e.target.value;
                setDraft(d => ({ ...d, answers: a }));
              }}
              style={{
                flex: 1, padding: "5px 8px", borderRadius: 6,
                border: `1px solid ${draft.correct === i ? "#10b981" : "rgba(255,255,255,.12)"}`,
                background: "var(--bg-primary)", color: "var(--text-primary)",
                fontSize: 12, outline: "none", fontFamily: "inherit",
              }}
            />
          </div>
        ))}
        <input
          value={draft.explain || ""}
          onChange={e => setDraft(d => ({ ...d, explain: e.target.value }))}
          placeholder="Giải thích (tuỳ chọn)..."
          style={{
            width: "100%", padding: "5px 8px", borderRadius: 6,
            border: "1px solid rgba(255,255,255,.08)", background: "var(--bg-primary)",
            color: "var(--text-secondary)", fontSize: 11, outline: "none",
            fontFamily: "inherit", marginTop: 4,
          }}
        />
        <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
          <button onClick={cancel} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 11 }}>
            <X size={11} /> Huỷ
          </button>
          <button onClick={save} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#10b981", color: "white", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            <Check size={11} /> Lưu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--bg-tertiary)", borderRadius: 9,
      border: "1px solid var(--border)", overflow: "hidden",
    }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: "7px 10px", display: "flex", alignItems: "flex-start",
          gap: 7, cursor: "pointer", userSelect: "none",
        }}
      >
        <span style={{
          minWidth: 20, height: 20, borderRadius: 5, background: "rgba(99,102,241,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: "var(--accent-blue)", flexShrink: 0,
        }}>{idx + 1}</span>
        <span style={{ flex: 1, fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4 }}>{q.q}</span>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); setEditing(true); setExpanded(false); }}
            style={{ background: "rgba(99,102,241,.15)", border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer", color: "var(--accent-blue)" }}
            title="Chỉnh sửa"
          ><Edit3 size={11} /></button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ background: "rgba(220,38,38,.15)", border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer", color: "#f87171" }}
            title="Xoá câu hỏi"
          ><Trash2 size={11} /></button>
          <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 10px 10px", borderTop: "1px solid var(--border)" }}>
          {q.answers.map((ans, i) => (
            <div key={i} style={{
              display: "flex", gap: 6, alignItems: "center", padding: "3px 0",
              color: i === q.correct ? "#10b981" : "var(--text-muted)", fontSize: 11,
            }}>
              <span style={{
                minWidth: 18, height: 18, borderRadius: 4,
                background: i === q.correct ? "rgba(16,185,129,.2)" : "rgba(255,255,255,.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800,
              }}>{ANSWER_LABELS[i]}</span>
              {ans}
              {i === q.correct && <span style={{ marginLeft: "auto", fontSize: 10 }}>✅</span>}
            </div>
          ))}
          {q.explain && (
            <div style={{
              marginTop: 6, fontSize: 11, color: "#60a5fa",
              padding: "5px 8px", background: "rgba(96,165,250,.08)",
              borderRadius: 5, borderLeft: "2px solid #3b82f6",
            }}>💡 {q.explain}</div>
          )}
        </div>
      )}
    </div>
  );
}

const PLAYER_COUNTS = [
  { value: "1p", label: "1 người" },
  { value: "2p", label: "2 người" },
  { value: "3p", label: "3 người" },
  { value: "4p", label: "4 người" },
];

const DEFAULT_NAMES = ["Người chơi 1", "Người chơi 2", "Người chơi 3", "Người chơi 4"];

export default function QuestionEditorPanel({
  questions: initialQuestions,
  editorSettings,
  isApplying,
  onApply,
  onSettingsChange,
}: QuestionEditorPanelProps) {
  const [questions, setQuestions] = useState<GameQuestion[]>(initialQuestions);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync when parent provides new questions (new game generated)
  const prevInitRef = useRef(initialQuestions);
  if (prevInitRef.current !== initialQuestions) {
    prevInitRef.current = initialQuestions;
    setQuestions(initialQuestions);
  }

  const tmpl = TEMPLATES.find(t => t.id === editorSettings.templateId);
  const supportsMulti = tmpl?.supportsMultiplayer ?? false;
  const playerCount = parseInt(editorSettings.playerMode[0]) || 1;

  function updateQ(idx: number, q: GameQuestion) {
    setQuestions(qs => qs.map((x, i) => i === idx ? q : x));
  }

  function deleteQ(idx: number) {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
  }

  function addBlank() {
    setQuestions(qs => [...qs, {
      q: "Câu hỏi mới...",
      answers: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correct: 0,
      explain: "",
    }]);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "questions.json";
    a.click();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = ev.target?.result as string;
        parseAndMerge(text);
      } catch {
        setBulkError("Không đọc được file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function parseAndMerge(text: string) {
    setBulkError("");
    let parsed: GameQuestion[] = [];
    // Try JSON
    try {
      const j = JSON.parse(text.trim());
      const arr = Array.isArray(j) ? j : [];
      parsed = arr.filter(q =>
        q && typeof q.q === "string" &&
        Array.isArray(q.answers) && q.answers.length === 4 &&
        typeof q.correct === "number"
      );
    } catch {
      // Try CSV: q,a,b,c,d,correct_index
      const lines = text.trim().split("\n").filter(l => l.trim());
      for (const line of lines) {
        const parts = line.split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 6) {
          parsed.push({
            q: parts[0],
            answers: [parts[1], parts[2], parts[3], parts[4]],
            correct: Math.max(0, Math.min(3, parseInt(parts[5]) || 0)),
            explain: parts[6] || "",
          });
        }
      }
    }
    if (parsed.length === 0) {
      setBulkError("Không tìm thấy câu hỏi hợp lệ. Dùng JSON array hoặc CSV (câu hỏi, A, B, C, D, index_đúng).");
      return;
    }
    setQuestions(qs => [...qs, ...parsed]);
    setBulkText("");
    setBulkOpen(false);
  }

  const isEmpty = initialQuestions.length === 0;

  const PLAYER_NAME_FIELDS: (keyof EditorSettings)[] = ["player1Name", "player2Name", "player3Name", "player4Name"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#10b981,#34d399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Edit3 size={12} color="white" />
          </span>
          Câu Hỏi & Cài Đặt
        </div>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
          {questions.length} câu
        </span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>

        {/* ── Player Settings ── */}
        <div style={{ padding: "10px 10px 0" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: ".05em", marginBottom: 6 }}>
            👥 SỐ NGƯỜI CHƠI
          </div>
          {/* Player count toggle — always shown */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {PLAYER_COUNTS.map(pc => {
              const active = editorSettings.playerMode === pc.value;
              const supports = supportsMulti || pc.value === "1p";
              // For single-player templates, only allow 1p
              // For multiplayer templates (wheel, kéo co, etc.) allow up to 4p
              const maxP = tmpl?.supportsMultiplayer ? 4 : 1;
              const pNum = parseInt(pc.value[0]);
              if (pNum > maxP) return null;
              return (
                <button
                  key={pc.value}
                  onClick={() => onSettingsChange({ ...editorSettings, playerMode: pc.value as EditorSettings["playerMode"] })}
                  style={{
                    padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: active ? 700 : 500,
                    border: `1px solid ${active ? "var(--accent-blue)" : "var(--border)"}`,
                    background: active ? "rgba(99,102,241,.15)" : "var(--bg-tertiary)",
                    color: active ? "var(--accent-blue)" : "var(--text-muted)",
                    cursor: "pointer", transition: "all .12s",
                  }}
                >{pc.label}</button>
              );
            })}
            {!supportsMulti && (
              <span style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: "center", fontStyle: "italic" }}>
                (Template này chỉ hỗ trợ 1 người)
              </span>
            )}
          </div>

          {/* Player name inputs */}
          {supportsMulti && playerCount > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: playerCount >= 3 ? "1fr 1fr" : "1fr 1fr", gap: 6, marginBottom: 10 }}>
              {Array.from({ length: playerCount }).map((_, i) => (
                <div key={i}>
                  <div style={{ fontSize: 9, color: i === 0 ? "var(--accent-blue)" : "#f97316", fontWeight: 700, marginBottom: 3 }}>
                    P{i + 1}
                  </div>
                  <input
                    type="text"
                    value={(editorSettings[PLAYER_NAME_FIELDS[i] as keyof EditorSettings] as string) || DEFAULT_NAMES[i]}
                    onChange={e => onSettingsChange({ ...editorSettings, [PLAYER_NAME_FIELDS[i]]: e.target.value })}
                    maxLength={14}
                    style={{
                      width: "100%", padding: "5px 7px", borderRadius: 6,
                      border: `1px solid ${i === 0 ? "rgba(99,102,241,.4)" : "rgba(249,115,22,.4)"}`,
                      background: "var(--bg-primary)", color: "var(--text-primary)",
                      fontSize: 11, outline: "none", fontFamily: "inherit",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ padding: "0 10px 8px", display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button
            onClick={addBlank}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
              borderRadius: 7, border: "1px solid rgba(16,185,129,.4)",
              background: "rgba(16,185,129,.1)", color: "#34d399",
              cursor: "pointer", fontSize: 11, fontWeight: 600,
            }}
          ><Plus size={11} /> Thêm câu</button>
          <button
            onClick={() => setBulkOpen(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
              borderRadius: 7, border: "1px solid rgba(59,130,246,.4)",
              background: "rgba(59,130,246,.1)", color: "#60a5fa",
              cursor: "pointer", fontSize: 11, fontWeight: 600,
            }}
          ><Upload size={11} /> Tải hàng loạt</button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
              borderRadius: 7, border: "1px solid var(--border)",
              background: "var(--bg-tertiary)", color: "var(--text-secondary)",
              cursor: "pointer", fontSize: 11,
            }}
          ><Upload size={11} /> File JSON/CSV</button>
          <input ref={fileRef} type="file" accept=".json,.csv,.txt" style={{ display: "none" }} onChange={handleFileUpload} />
          {questions.length > 0 && (
            <button
              onClick={downloadJson}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
                borderRadius: 7, border: "1px solid var(--border)",
                background: "var(--bg-tertiary)", color: "var(--text-secondary)",
                cursor: "pointer", fontSize: 11,
              }}
            ><Download size={11} /> Xuất JSON</button>
          )}
        </div>

        {/* Bulk upload panel */}
        {bulkOpen && (
          <div style={{ margin: "0 10px 10px", padding: 10, background: "rgba(59,130,246,.06)", borderRadius: 9, border: "1px solid rgba(59,130,246,.2)" }}>
            <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 700, marginBottom: 5 }}>
              DÁN JSON hoặc CSV (câu hỏi, A, B, C, D, index_đúng, giải thích)
            </div>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              rows={5}
              placeholder={'[{"q":"...","answers":["A","B","C","D"],"correct":0}]'}
              style={{
                width: "100%", padding: "7px 9px", borderRadius: 7,
                border: "1px solid rgba(59,130,246,.3)", background: "var(--bg-primary)",
                color: "var(--text-primary)", fontSize: 11, resize: "vertical",
                outline: "none", fontFamily: "monospace", lineHeight: 1.5,
              }}
            />
            {bulkError && <div style={{ fontSize: 10, color: "#f87171", marginTop: 4 }}>⚠️ {bulkError}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <button
                onClick={() => parseAndMerge(bulkText)}
                style={{
                  padding: "5px 12px", borderRadius: 7, border: "none",
                  background: "#3b82f6", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}
              >✅ Thêm vào</button>
              <button
                onClick={() => { setBulkOpen(false); setBulkText(""); setBulkError(""); }}
                style={{
                  padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)",
                  background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer",
                }}
              >Huỷ</button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !bulkOpen && (
          <div style={{
            margin: "20px 10px", padding: "24px 16px", background: "var(--bg-tertiary)",
            borderRadius: 12, border: "1px dashed var(--border)", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Chưa có câu hỏi</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Tạo game từ panel bên trái hoặc thêm câu hỏi thủ công
            </div>
          </div>
        )}

        {/* Question list */}
        <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          {questions.map((q, idx) => (
            <QuestionCard
              key={idx}
              q={q}
              idx={idx}
              onUpdate={nq => updateQ(idx, nq)}
              onDelete={() => deleteQ(idx)}
            />
          ))}
        </div>
      </div>

      {/* Apply button */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button
          onClick={() => onApply(questions, editorSettings)}
          disabled={isApplying || questions.length === 0}
          style={{
            width: "100%", padding: "11px", borderRadius: 9, border: "none",
            background: isApplying || questions.length === 0
              ? "var(--bg-tertiary)"
              : "linear-gradient(135deg, #10b981, #34d399)",
            color: isApplying || questions.length === 0 ? "var(--text-muted)" : "white",
            fontSize: 13, fontWeight: 800, cursor: isApplying || questions.length === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            transition: "all .2s",
            boxShadow: questions.length > 0 && !isApplying ? "0 4px 12px rgba(16,185,129,.35)" : "none",
          }}
        >
          {isApplying ? (
            <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Đang cập nhật game...</>
          ) : (
            <><RefreshCw size={14} /> Áp Dụng Vào Game ({questions.length} câu)</>
          )}
        </button>
      </div>
    </div>
  );
}
