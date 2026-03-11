"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, Edit3, Check, X, FileSpreadsheet,
  Upload, FileText, RefreshCw, ChevronDown, ChevronUp, Loader2,
  CheckSquare, Square, SquareCheck
} from "lucide-react";
import { GameQuestion, TemplateId, TEMPLATES } from "@/lib/templates/types";
import * as XLSX from "xlsx";

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
  apiKey: string;
  onApply: (questions: GameQuestion[], settings: EditorSettings) => void;
  onSettingsChange: (settings: EditorSettings) => void;
}

const ANSWER_LABELS = ["A", "B", "C", "D"];
const PLAYER_COUNTS = [
  { value: "1p", label: "1 người" },
  { value: "2p", label: "2 người" },
  { value: "3p", label: "3 người" },
  { value: "4p", label: "4 người" },
];
const DEFAULT_NAMES = ["Người chơi 1", "Người chơi 2", "Người chơi 3", "Người chơi 4"];
const PLAYER_NAME_FIELDS: (keyof EditorSettings)[] = ["player1Name", "player2Name", "player3Name", "player4Name"];

// ── Question Card ──────────────────────────────────────────────
function QuestionCard({ q, idx, onUpdate, onDelete, selectMode, selected, onToggleSelect }: {
  q: GameQuestion; idx: number;
  onUpdate: (q: GameQuestion) => void;
  onDelete: () => void;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<GameQuestion>({ ...q });

  function save() { onUpdate(draft); setEditing(false); setExpanded(false); }
  function cancel() { setDraft({ ...q }); setEditing(false); }

  if (editing) {
    return (
      <div style={{ background: "rgba(99,102,241,.08)", borderRadius: 10, border: "1px solid rgba(99,102,241,.35)", padding: "10px" }}>
        <div style={{ fontSize: 10, color: "var(--accent-blue)", fontWeight: 700, marginBottom: 6 }}>CÂU {idx + 1} — ĐANG CHỈNH SỬA</div>
        <textarea value={draft.q} onChange={e => setDraft(d => ({ ...d, q: e.target.value }))} rows={2}
          style={{ width: "100%", padding: "7px 9px", borderRadius: 7, border: "1px solid rgba(99,102,241,.4)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 12, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, marginBottom: 8 }} />
        {draft.answers.map((ans, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5, alignItems: "center" }}>
            <button onClick={() => setDraft(d => ({ ...d, correct: i }))}
              style={{ width: 22, height: 22, borderRadius: "50%", border: "none", background: draft.correct === i ? "#10b981" : "rgba(255,255,255,.1)", cursor: "pointer", flexShrink: 0, fontSize: 10, color: draft.correct === i ? "white" : "var(--text-muted)", fontWeight: 700 }}
              title="Đặt làm đáp án đúng">{ANSWER_LABELS[i]}</button>
            <input value={ans} onChange={e => { const a = [...draft.answers]; a[i] = e.target.value; setDraft(d => ({ ...d, answers: a })); }}
              style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: `1px solid ${draft.correct === i ? "#10b981" : "rgba(255,255,255,.12)"}`, background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
          </div>
        ))}
        <input value={draft.explain || ""} onChange={e => setDraft(d => ({ ...d, explain: e.target.value }))} placeholder="Giải thích (tuỳ chọn)..."
          style={{ width: "100%", padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,.08)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: 11, outline: "none", fontFamily: "inherit", marginTop: 4 }} />
        <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
          <button onClick={cancel} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <X size={11} /> Huỷ</button>
          <button onClick={save} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#10b981", color: "white", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            <Check size={11} /> Lưu</button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: selected ? "rgba(99,102,241,.12)" : "var(--bg-tertiary)",
        borderRadius: 9,
        border: `1px solid ${selected ? "rgba(99,102,241,.5)" : "var(--border)"}`,
        overflow: "hidden",
        transition: "all .15s",
      }}
    >
      <div onClick={() => selectMode ? onToggleSelect() : setExpanded(e => !e)}
        style={{ padding: "7px 10px", display: "flex", alignItems: "flex-start", gap: 7, cursor: "pointer", userSelect: "none" }}>
        {selectMode ? (
          <span style={{ flexShrink: 0, color: selected ? "var(--accent-blue)" : "var(--text-muted)", display: "flex", alignItems: "center", paddingTop: 1 }}>
            {selected ? <SquareCheck size={16} /> : <Square size={16} />}
          </span>
        ) : (
          <span style={{ minWidth: 20, height: 20, borderRadius: 5, background: "rgba(99,102,241,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--accent-blue)", flexShrink: 0 }}>{idx + 1}</span>
        )}
        <span style={{ flex: 1, fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4 }}>{q.q}</span>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); setEditing(true); setExpanded(false); }}
            style={{ background: "rgba(99,102,241,.15)", border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer", color: "var(--accent-blue)" }} title="Chỉnh sửa"><Edit3 size={11} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ background: "rgba(220,38,38,.15)", border: "none", borderRadius: 5, padding: "3px 6px", cursor: "pointer", color: "#f87171" }} title="Xoá"><Trash2 size={11} /></button>
          <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 10px 10px", borderTop: "1px solid var(--border)" }}>
          {q.answers.map((ans, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", padding: "3px 0", color: i === q.correct ? "#10b981" : "var(--text-muted)", fontSize: 11 }}>
              <span style={{ minWidth: 18, height: 18, borderRadius: 4, background: i === q.correct ? "rgba(16,185,129,.2)" : "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{ANSWER_LABELS[i]}</span>
              {ans}{i === q.correct && <span style={{ marginLeft: "auto", fontSize: 10 }}>✅</span>}
            </div>
          ))}
          {q.explain && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#60a5fa", padding: "5px 8px", background: "rgba(96,165,250,.08)", borderRadius: 5, borderLeft: "2px solid #3b82f6" }}>💡 {q.explain}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Panel ──────────────────────────────────────────────────
export default function QuestionEditorPanel({
  questions: initialQuestions,
  editorSettings,
  isApplying,
  apiKey,
  onApply,
  onSettingsChange,
}: QuestionEditorPanelProps) {
  const [questions, setQuestions] = useState<GameQuestion[]>(initialQuestions);
  const [wordLoading, setWordLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());

  const excelRef = useRef<HTMLInputElement>(null);
  const wordRef = useRef<HTMLInputElement>(null);

  // Sync when parent provides new questions (after AI generation)
  const prevRef = useRef(initialQuestions);
  if (prevRef.current !== initialQuestions) {
    prevRef.current = initialQuestions;
    setQuestions(initialQuestions);
  }

  const tmpl = TEMPLATES.find(t => t.id === editorSettings.templateId);
  const playerCount = parseInt(editorSettings.playerMode[0]) || 1;

  function updateQ(idx: number, q: GameQuestion) { setQuestions(qs => qs.map((x, i) => i === idx ? q : x)); }
  function deleteQ(idx: number) { setQuestions(qs => qs.filter((_, i) => i !== idx)); }

  function toggleSelectMode() {
    setSelectMode(v => !v);
    setSelectedSet(new Set());
  }
  function toggleSelect(idx: number) {
    setSelectedSet(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }
  function selectAll() {
    if (selectedSet.size === questions.length) setSelectedSet(new Set());
    else setSelectedSet(new Set(questions.map((_, i) => i)));
  }
  function deleteSelected() {
    setQuestions(qs => qs.filter((_, i) => !selectedSet.has(i)));
    setSelectedSet(new Set());
    setSelectMode(false);
  }
  function addBlank() {
    const newQ: GameQuestion = { q: "Câu hỏi mới... (click ✏️ để chỉnh sửa)", answers: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correct: 0, explain: "" };
    setQuestions(qs => [...qs, newQ]);
    setImportError("");
  }

  // ── Download sample Excel ──────────────────────────────────────
  function downloadSampleExcel() {
    const ws_data = [
      ["Câu hỏi (*bắt buộc)", "Đáp án A (*)", "Đáp án B (*)", "Đáp án C (*)", "Đáp án D (*)", "Đáp án đúng (0=A,1=B,2=C,3=D) (*)", "Giải thích (tuỳ chọn)"],
      ["Thủ đô của Việt Nam là gì?", "Thành phố Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Huế", 1, "Hà Nội là thủ đô của Việt Nam từ năm 1010"],
      ["2 + 2 bằng bao nhiêu?", "3", "4", "5", "6", 1, "2 cộng 2 bằng 4"],
      ["Nguyên tố hoá học nào có ký hiệu O?", "Oxy", "Ozon", "Osmium", "Oganesson", 0, "Oxy (O) là nguyên tố số 8 trong bảng tuần hoàn"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Column widths
    ws["!cols"] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 35 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Câu hỏi");
    XLSX.writeFile(wb, "mau_cau_hoi_edugame.xlsx");
  }

  // ── Upload Excel ───────────────────────────────────────────────
  function handleExcelFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = ev.target?.result;
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        // Skip header row (row 0)
        const parsed: GameQuestion[] = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || !r[0]) continue; // skip empty rows
          const q = String(r[0] || "").trim();
          const a0 = String(r[1] || "").trim();
          const a1 = String(r[2] || "").trim();
          const a2 = String(r[3] || "").trim();
          const a3 = String(r[4] || "").trim();
          const correct = Math.max(0, Math.min(3, parseInt(String(r[5] ?? 0)) || 0));
          const explain = String(r[6] || "").trim();

          if (!q || !a0 || !a1 || !a2 || !a3) continue;
          parsed.push({ q, answers: [a0, a1, a2, a3], correct, explain });
        }

        if (parsed.length === 0) {
          setImportError("Không tìm thấy câu hỏi hợp lệ. Hãy dùng file mẫu để nhập đúng định dạng.");
          return;
        }
        setQuestions(qs => [...qs, ...parsed]);
        setImportError(`✅ Đã thêm ${parsed.length} câu hỏi từ file Excel!`);
      } catch {
        setImportError("Lỗi đọc file Excel. Hãy chắc chắn đúng định dạng .xlsx");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  // ── Upload Word → AI extract ───────────────────────────────────
  async function handleWordFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");

    if (!apiKey) {
      setImportError("⚠️ Cần có API key để trích xuất file Word bằng AI.");
      e.target.value = "";
      return;
    }

    setWordLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("apiKey", apiKey);

      const res = await fetch("/api/extract-word", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setImportError(`❌ ${data.error || "Lỗi trích xuất file Word."}`);
        return;
      }

      setQuestions(qs => [...qs, ...data.questions]);
      setImportError(`✅ AI đã trích xuất được ${data.count} câu hỏi từ file Word!`);
    } catch {
      setImportError("❌ Lỗi kết nối server khi xử lý file Word.");
    } finally {
      setWordLoading(false);
    }
    e.target.value = "";
  }

  const isEmpty = initialQuestions.length === 0 && questions.length === 0;

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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {questions.length > 0 && (
            <button
              onClick={toggleSelectMode}
              style={{
                padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${selectMode ? "rgba(239,68,68,.5)" : "rgba(99,102,241,.4)"}`,
                background: selectMode ? "rgba(239,68,68,.12)" : "rgba(99,102,241,.1)",
                color: selectMode ? "#f87171" : "var(--accent-blue)",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              {selectMode ? <><X size={10} /> Thoát</> : <><CheckSquare size={10} /> Chọn</>}
            </button>
          )}
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{questions.length} câu</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>

        {/* ── Player Settings ── */}
        <div id="tour-players" style={{ padding: "10px 10px 0" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: ".05em", marginBottom: 6 }}>👥 SỐ NGƯỜI CHƠI</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {PLAYER_COUNTS.map(pc => {
              const active = editorSettings.playerMode === pc.value;
              const maxP = tmpl?.supportsMultiplayer ? 4 : 1;
              if (parseInt(pc.value[0]) > maxP) return null;
              return (
                <button key={pc.value}
                  onClick={() => onSettingsChange({ ...editorSettings, playerMode: pc.value as EditorSettings["playerMode"] })}
                  style={{ padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: active ? 700 : 500, border: `1px solid ${active ? "var(--accent-blue)" : "var(--border)"}`, background: active ? "rgba(99,102,241,.15)" : "var(--bg-tertiary)", color: active ? "var(--accent-blue)" : "var(--text-muted)", cursor: "pointer", transition: "all .12s" }}
                >{pc.label}</button>
              );
            })}
            {!tmpl?.supportsMultiplayer && (
              <span style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: "center", fontStyle: "italic" }}>(chỉ hỗ trợ 1 người)</span>
            )}
          </div>
          {tmpl?.supportsMultiplayer && playerCount > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              {Array.from({ length: playerCount }).map((_, i) => (
                <div key={i}>
                  <div style={{ fontSize: 9, color: i === 0 ? "var(--accent-blue)" : "#f97316", fontWeight: 700, marginBottom: 3 }}>P{i + 1}</div>
                  <input type="text"
                    value={(editorSettings[PLAYER_NAME_FIELDS[i] as keyof EditorSettings] as string) || DEFAULT_NAMES[i]}
                    onChange={e => onSettingsChange({ ...editorSettings, [PLAYER_NAME_FIELDS[i]]: e.target.value })}
                    maxLength={14}
                    style={{ width: "100%", padding: "5px 7px", borderRadius: 6, border: `1px solid ${i === 0 ? "rgba(99,102,241,.4)" : "rgba(249,115,22,.4)"}`, background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 4 Import Buttons ── */}
        <div style={{ padding: "0 10px 8px" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: ".05em", marginBottom: 6 }}>📥 NHẬP CÂU HỎI</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>

            {/* Btn 1: Add manual */}
            <button onClick={addBlank}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 9, border: "1px solid rgba(16,185,129,.4)", background: "rgba(16,185,129,.08)", color: "#34d399", cursor: "pointer" }}>
              <Plus size={16} />
              <span style={{ fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>Nhập thủ công</span>
            </button>

            {/* Btn 2: Download sample Excel */}
            <button onClick={downloadSampleExcel}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 9, border: "1px solid rgba(34,197,94,.4)", background: "rgba(34,197,94,.08)", color: "#4ade80", cursor: "pointer" }}>
              <FileSpreadsheet size={16} />
              <span style={{ fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>Excel mẫu</span>
            </button>

            {/* Btn 3: Upload Excel */}
            <button onClick={() => excelRef.current?.click()}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 9, border: "1px solid rgba(59,130,246,.4)", background: "rgba(59,130,246,.08)", color: "#60a5fa", cursor: "pointer" }}>
              <Upload size={16} />
              <span style={{ fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>Tải Excel lên</span>
            </button>

            {/* Btn 4: Upload Word → AI */}
            <button onClick={() => wordRef.current?.click()}
              disabled={wordLoading}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 9, border: "1px solid rgba(168,85,247,.4)", background: "rgba(168,85,247,.08)", color: wordLoading ? "var(--text-muted)" : "#c084fc", cursor: wordLoading ? "not-allowed" : "pointer", opacity: wordLoading ? 0.7 : 1 }}>
              {wordLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <FileText size={16} />}
              <span style={{ fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{wordLoading ? "AI đang xử lý..." : "Word → AI"}</span>
            </button>

          </div>

          {/* Hidden file inputs */}
          <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleExcelFile} />
          <input ref={wordRef} type="file" accept=".docx,.doc" style={{ display: "none" }} onChange={handleWordFile} />

          {/* Status / error message */}
          {importError && (
            <div style={{
              marginTop: 8, padding: "7px 10px", borderRadius: 7, fontSize: 11, lineHeight: 1.4,
              background: importError.startsWith("✅") ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)",
              border: `1px solid ${importError.startsWith("✅") ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.3)"}`,
              color: importError.startsWith("✅") ? "#34d399" : "#f87171",
            }}>{importError}</div>
          )}

          {/* Word format guide hint */}
          <div style={{ marginTop: 6, padding: "6px 8px", borderRadius: 7, background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.15)", fontSize: 10, color: "#a78bfa", lineHeight: 1.5 }}>
            💡 <strong>File Word:</strong> gạch chân hoặc in đậm đáp án đúng. AI sẽ tự nhận dạng.
          </div>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div style={{ margin: "10px 10px", padding: "20px 16px", background: "var(--bg-tertiary)", borderRadius: 12, border: "1px dashed var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📝</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>Chưa có câu hỏi</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>Tạo game từ panel trái hoặc nhập câu hỏi ở trên</div>
          </div>
        )}

        {/* Question list */}
        {selectMode && questions.length > 0 && (
          <div style={{ padding: "0 10px 6px", display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={selectAll}
              style={{ fontSize: 10, color: "var(--accent-blue)", background: "none", border: "none", cursor: "pointer", padding: "2px 0", fontWeight: 700 }}>
              {selectedSet.size === questions.length ? "Boỏ chọn tất cả" : "Chọn tất cả"}
            </button>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>• Đả chọn: {selectedSet.size}</span>
          </div>
        )}
        <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          {questions.map((q, idx) => (
            <QuestionCard key={idx} q={q} idx={idx}
              selectMode={selectMode}
              selected={selectedSet.has(idx)}
              onToggleSelect={() => toggleSelect(idx)}
              onUpdate={nq => updateQ(idx, nq)}
              onDelete={() => deleteQ(idx)} />
          ))}
        </div>
      </div>

      {/* Bulk delete bar (shown when items selected in selectMode) */}
      {selectMode && selectedSet.size > 0 && (
        <div style={{
          padding: "7px 10px", borderTop: "1px solid rgba(239,68,68,.25)",
          background: "rgba(239,68,68,.08)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <span style={{ flex: 1, fontSize: 11, color: "#f87171", fontWeight: 600 }}>Xoá {selectedSet.size} câu đã chọn?</span>
          <button onClick={() => setSelectedSet(new Set())}
            style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 11 }}>Huỷ</button>
          <button onClick={deleteSelected}
            style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#dc2626", color: "white", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            <Trash2 size={11} /> Xoá {selectedSet.size} câu</button>
        </div>
      )}

      {/* Apply button */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button
          onClick={() => onApply(questions, editorSettings)}
          disabled={isApplying || questions.length === 0}
          style={{
            width: "100%", padding: "11px", borderRadius: 9, border: "none",
            background: isApplying || questions.length === 0 ? "var(--bg-tertiary)" : "linear-gradient(135deg, #10b981, #34d399)",
            color: isApplying || questions.length === 0 ? "var(--text-muted)" : "white",
            fontSize: 13, fontWeight: 800, cursor: isApplying || questions.length === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            transition: "all .2s",
            boxShadow: questions.length > 0 && !isApplying ? "0 4px 12px rgba(16,185,129,.35)" : "none",
          }}
        >
          {isApplying
            ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Đang cập nhật game...</>
            : <><RefreshCw size={14} /> Áp Dụng Vào Game ({questions.length} câu)</>}
        </button>
      </div>
    </div>
  );
}
