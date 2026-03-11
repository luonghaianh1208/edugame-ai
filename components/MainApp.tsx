"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Settings, GraduationCap, Gamepad2, Github, Sparkles } from "lucide-react";
import InputPanel, { GameParams } from "./InputPanel";
import CodePanel from "./CodePanel";
import PreviewPanel from "./PreviewPanel";
import QuestionEditorPanel, { EditorSettings } from "./QuestionEditorPanel";
import ApiKeyModal from "./ApiKeyModal";
import TourGuide from "./TourGuide";
import { GameQuestion } from "@/lib/templates/types";

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function MainApp() {
  const [code, setCode] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState<GameQuestion[]>([]);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    templateId: "rpg-battle",
    playerMode: "1p",
    player1Name: "Người chơi 1",
    player2Name: "Người chơi 2",
    player3Name: "Người chơi 3",
    player4Name: "Người chơi 4",
  });
  const [currentTopic, setCurrentTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");

  // ── Resizable panel widths ───────────────────────────────────────
  const [leftW,  setLeftW]  = useState(290);
  const [rightW, setRightW] = useState(280);
  const [midSplit, setMidSplit] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    handle: "L" | "M" | "R";
    startX: number;
    startVal: number;
    containerW: number;
  } | null>(null);

  const startDrag = useCallback((e: React.MouseEvent, handle: "L" | "M" | "R") => {
    e.preventDefault();
    const totalW = containerRef.current?.offsetWidth ?? window.innerWidth;
    dragRef.current = {
      handle,
      startX: e.clientX,
      startVal: handle === "L" ? leftW : handle === "R" ? rightW : midSplit,
      containerW: totalW,
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const { handle, startX, startVal, containerW } = dragRef.current;
      const dx = ev.clientX - startX;
      const MIN = 160;
      if (handle === "L") {
        setLeftW(Math.max(MIN, Math.min(startVal + dx, containerW * 0.4)));
      } else if (handle === "R") {
        setRightW(Math.max(MIN, Math.min(startVal - dx, containerW * 0.4)));
      } else {
        const midW = containerW - leftW - rightW - 6;
        const newSplit = Math.max(0.15, Math.min(0.85, startVal + dx / midW));
        setMidSplit(newSplit);
      }
    }
    function onUp() {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [leftW, rightW, midSplit]);

  useEffect(() => {
    const saved = localStorage.getItem("edugame_api_key");
    if (saved) setApiKey(saved);
    else setShowKeyModal(true);
  }, []);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleSaveKey(key: string) {
    setApiKey(key);
    localStorage.setItem("edugame_api_key", key);
    showToast("API key đã được lưu thành công!", "success");
  }

  const handleGenerate = useCallback(async (params: GameParams) => {
    if (!apiKey) { setShowKeyModal(true); return; }
    setIsGenerating(true);
    setCode("");
    setCurrentQuestions([]);
    setActiveTab("code");

    try {
      const res = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, apiKey }),
      });

      const data = await res.json();

      if (!res.ok) { showToast(data.error || "Lỗi tạo game", "error"); return; }
      if (!data.html) { showToast("AI không trả về game hợp lệ. Hãy thử lại.", "error"); return; }

      setCode(data.html);
      if (data.questions) setCurrentQuestions(data.questions);

      // Update editor settings from params
      setCurrentTopic(params.topic);
      setEditorSettings(prev => ({
        ...prev,
        templateId: params.templateId,
        playerMode: params.playerMode as EditorSettings["playerMode"],
        player1Name: params.player1Name || prev.player1Name,
        player2Name: params.player2Name || prev.player2Name,
      }));

      showToast(`🎮 Game đã tạo xong! ${data.questionCount} câu hỏi`, "success");
      setTimeout(() => setActiveTab("preview"), 400);

    } catch {
      showToast("Lỗi kết nối server. Kiểm tra lại kết nối mạng.", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const handleApplyToGame = useCallback(async (questions: GameQuestion[], settings: EditorSettings) => {
    if (questions.length === 0) return;
    setIsApplying(true);
    try {
      const res = await fetch("/api/rebuild-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          templateId: settings.templateId,
          topic: currentTopic || "Kiến thức tổng hợp",
          playerMode: settings.playerMode,
          player1Name: settings.player1Name,
          player2Name: settings.player2Name,
          player3Name: settings.player3Name,
          player4Name: settings.player4Name,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Lỗi cập nhật game", "error"); return; }
      setCode(data.html);
      setCurrentQuestions(questions);
      showToast(`✅ Game đã được cập nhật với ${data.questionCount} câu hỏi!`, "success");
      setActiveTab("preview");
    } catch {
      showToast("Lỗi kết nối server khi cập nhật game.", "error");
    } finally {
      setIsApplying(false);
    }
  }, [currentTopic]);

  const hasKey = !!apiKey;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)", overflow: "hidden" }}>
      {/* Top navbar */}
      <nav style={{
        height: 50, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, overflow: "hidden",
            flexShrink: 0, border: "1px solid rgba(255,255,255,.1)",
          }}>
            <img
              src="https://www.luonghaianhchemcnt.edu.vn/wp-content/uploads/2025/09/cropped-ChatGPT-Image-00_12_51-30-thg-7-2025.png"
              alt="logo"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>EduGame</span>
            <span style={{ fontSize: 15, fontWeight: 400, color: "var(--accent-blue)" }}> AI</span>
          </div>
          <span className="badge badge-blue" style={{ marginLeft: 4, fontSize: 10 }}>
            <Sparkles size={9} /> 2Anh AI Education
          </span>
        </div>

        <div style={{ display: "flex", gap: 2, background: "var(--bg-tertiary)", padding: 3, borderRadius: 8, border: "1px solid var(--border)" }}>
          {[
            { key: "preview", icon: <Gamepad2 size={13} />, label: "Preview" },
            { key: "code", icon: <Github size={13} />, label: "Code" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "code" | "preview")}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: activeTab === tab.key ? "var(--bg-secondary)" : "transparent",
                color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.15s",
                boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Tour guide help button */}
          <TourGuide autoShow />

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: hasKey ? "var(--accent-green)" : "var(--accent-orange)",
              boxShadow: hasKey ? "0 0 6px var(--accent-green)" : "0 0 6px var(--accent-orange)",
            }} />
            <span style={{ color: "var(--text-secondary)" }}>
              {hasKey ? "API key OK" : "Chưa có API key"}
            </span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
              borderRadius: 7, background: "var(--bg-tertiary)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-blue)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
          >
            <Settings size={13} /> Cài đặt
          </button>
        </div>
      </nav>

      {/* Main layout */}
      <div
        ref={containerRef}
        style={{
          flex: 1, display: "flex", flexDirection: "row",
          overflow: "hidden", background: "var(--border)", gap: 0,
        }}
      >
        {/* Panel 1: Input */}
        <div style={{ width: leftW, flexShrink: 0, background: "var(--bg-secondary)", overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        {/* Divider L */}
        <div
          onMouseDown={e => startDrag(e, "L")}
          style={{ width: 4, flexShrink: 0, background: "var(--border)", cursor: "col-resize", transition: "background 0.15s", position: "relative" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-blue)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
        >
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6 }} />)}
          </div>
        </div>

        {/* Panel 2: Code or Preview (tabbed) */}
        <div id="tour-preview" style={{ flex: midSplit, minWidth: 0, background: "var(--bg-secondary)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, opacity: activeTab === "code" ? 1 : 0, pointerEvents: activeTab === "code" ? "auto" : "none", zIndex: activeTab === "code" ? 1 : 0 }}>
            <CodePanel code={code} onChange={setCode} isStreaming={isGenerating} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: activeTab === "preview" ? 1 : 0, pointerEvents: activeTab === "preview" ? "auto" : "none", zIndex: activeTab === "preview" ? 1 : 0 }}>
            <PreviewPanel code={code} />
          </div>
        </div>

        {/* Divider M */}
        <div
          onMouseDown={e => startDrag(e, "M")}
          style={{ width: 4, flexShrink: 0, background: "var(--border)", cursor: "col-resize", transition: "background 0.15s", position: "relative" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-blue)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
        >
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6 }} />)}
          </div>
        </div>

        {/* Panel 3: Preview or Code (the other one) */}
        <div style={{ flex: 1 - midSplit, minWidth: 0, background: "var(--bg-secondary)", overflow: "hidden" }}>
          {activeTab === "preview" ? (
            <CodePanel code={code} onChange={setCode} isStreaming={isGenerating} />
          ) : (
            <PreviewPanel code={code} />
          )}
        </div>

        {/* Divider R */}
        <div
          onMouseDown={e => startDrag(e, "R")}
          style={{ width: 4, flexShrink: 0, background: "var(--border)", cursor: "col-resize", transition: "background 0.15s", position: "relative" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-blue)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
        >
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6 }} />)}
          </div>
        </div>

        {/* Panel 4: Question Editor */}
        <div id="tour-editor" style={{ width: rightW, flexShrink: 0, background: "var(--bg-secondary)", overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <QuestionEditorPanel
            questions={currentQuestions}
            editorSettings={editorSettings}
            isApplying={isApplying}
            apiKey={apiKey}
            onApply={handleApplyToGame}
            onSettingsChange={setEditorSettings}
          />
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleSaveKey}
        currentKey={apiKey}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"} fade-in`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}
    </div>
  );
}
