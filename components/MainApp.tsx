"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Settings, GraduationCap, Gamepad2, Github, Sparkles } from "lucide-react";
import InputPanel, { GameParams } from "./InputPanel";
import CodePanel from "./CodePanel";
import PreviewPanel from "./PreviewPanel";
import ChatPanel, { ChatMessage } from "./ChatPanel";
import ApiKeyModal from "./ApiKeyModal";

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function MainApp() {
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");

  // ── Resizable panel widths ───────────────────────────────────────
  const [leftW,  setLeftW]  = useState(290);   // InputPanel width px
  const [rightW, setRightW] = useState(265);   // ChatPanel width px
  const [midSplit, setMidSplit] = useState(0.5); // 0..1 ratio for panels 2 & 3
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    handle: "L" | "M" | "R"; // Left, Mid, Right divider
    startX: number;
    startVal: number;        // initial leftW / midSplit / rightW
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
        // midSplit: fraction (0..1) of middle area for panel-2
        // midWidth = containerW - leftW - rightW - 6 (3 dividers × 2px)
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

  // Load API key from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("edugame_api_key");
    if (saved) setApiKey(saved);
    else setShowKeyModal(true); // Show modal on first visit
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
    setChatMessages([]);
    setActiveTab("code");

    try {
      const res = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Lỗi tạo game", "error");
        return;
      }

      if (!data.html) {
        showToast("AI không trả về game hợp lệ. Hãy thử lại.", "error");
        return;
      }

      setCode(data.html);
      showToast(`🎮 Game đã tạo xong! ${data.questionCount} câu hỏi`, "success");
      setTimeout(() => setActiveTab("preview"), 400);

    } catch {
      showToast("Lỗi kết nối server. Kiểm tra lại kết nối mạng.", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const handleChatSend = useCallback(async (message: string) => {
    if (!apiKey) { setShowKeyModal(true); return; }

    const userMsg: ChatMessage = { role: "user", content: message };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCode: code, message, apiKey }),
      });

      // Non-streaming error (e.g. 401, 400, 500 JSON)
      if (!res.ok) {
        let errMsg = "Lỗi server.";
        try { const d = await res.json(); errMsg = d.error || errMsg; } catch {}
        setChatMessages(prev => [...prev, { role: "assistant", content: `❌ ${errMsg}` }]);
        return;
      }

      // ── Stream reading ───────────────────────────────────────────
      const reader = res.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // ── Parse [REPLY] and extract code with 3-tier fallback ──────
      // Extract reply text (everything before [CODE] if present)
      const replyMatch = fullText.match(/\[REPLY\]([\s\S]*?)(?=\[CODE\]|$)/i);
      const replyText = replyMatch ? replyMatch[1].trim() : fullText.split(/```html?/i)[0].replace(/\[REPLY\]/i, "").trim();

      // Tier 1: explicit [CODE]...[/CODE] delimiter
      let patchedCode: string | null = null;
      const t1 = fullText.match(/\[CODE\]([\s\S]*?)\[\/CODE\]/i);
      if (t1) {
        patchedCode = t1[1].trim().replace(/^```html?\s*/i, "").replace(/\s*```\s*$/, "").trim();
      }

      // Tier 2: markdown ```html or ``` fences containing <!DOCTYPE
      if (!patchedCode) {
        const t2 = fullText.match(/```html?\s*([\s\S]*?)```/i);
        if (t2 && t2[1].toLowerCase().includes("<!doctype html")) {
          patchedCode = t2[1].trim();
        }
      }

      // Tier 3: raw <!DOCTYPE html ... </html> block anywhere in text
      if (!patchedCode) {
        const t3 = fullText.match(/(<!DOCTYPE html[\s\S]*?<\/html>)/i);
        if (t3) {
          patchedCode = t3[1].trim();
        }
      }

      // Validate HTML
      if (patchedCode && !patchedCode.toLowerCase().includes("<!doctype html")) {
        patchedCode = null;
      }

      // Check for stream error
      if (fullText.includes("__CHAT_ERROR__:")) {
        const errMsg = fullText.split("__CHAT_ERROR__:")[1]?.split("\n")[0] || "Lỗi AI";
        setChatMessages(prev => [...prev, { role: "assistant", content: `❌ Lỗi AI: ${errMsg}` }]);
        return;
      }

      const hasCodeUpdate = false;  // not applied yet - user must click Apply
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: replyText || (patchedCode ? "🔧 AI đã chuẩn bị code chỉnh sửa. Bấm Áp dụng để cập nhật." : "Đã xử lý yêu cầu."),
        hasCodeUpdate,
        pendingCode: patchedCode ?? undefined,
      }]);

      // Do NOT auto-apply - user must click the Apply button in chat
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi không xác định";
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ Lỗi: ${msg}. Hãy kiểm tra kết nối mạng và thử lại.`,
      }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [apiKey, code]);

  // Apply code patch when user clicks the Apply button in the chat
  const handleApplyCode = useCallback((code: string) => {
    setCode(code);
    // Mark the message as applied (remove pendingCode)
    setChatMessages(prev =>
      prev.map(m => m.pendingCode === code
        ? { ...m, pendingCode: undefined, hasCodeUpdate: true }
        : m
      )
    );
    showToast("✅ Code đã được áp dụng vào editor!", "success");
    setActiveTab("preview");
  }, []);

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
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #1f6feb, #a371f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GraduationCap size={18} color="white" />
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>EduGame</span>
            <span style={{ fontSize: 15, fontWeight: 400, color: "var(--accent-blue)" }}> AI</span>
          </div>
          <span className="badge badge-blue" style={{ marginLeft: 4, fontSize: 10 }}>
            <Sparkles size={9} /> gemini-3-flash-preview
          </span>
        </div>

        {/* Center tabs for code/preview on smaller screens */}
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

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

      {/* Main layout: 4 panels with drag-to-resize dividers */}
      <div
        ref={containerRef}
        style={{
          flex: 1, display: "flex", flexDirection: "row",
          overflow: "hidden", background: "var(--border)", gap: 0,
        }}
      >
        {/* ── Panel 1: Input ── */}
        <div style={{ width: leftW, flexShrink: 0, background: "var(--bg-secondary)", overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        {/* ── Divider L ── */}
        <div
          onMouseDown={e => startDrag(e, "L")}
          style={{
            width: 4, flexShrink: 0, background: "var(--border)",
            cursor: "col-resize", transition: "background 0.15s",
            position: "relative",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-blue)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
        >
          {/* Visual grip dots */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6 }} />)}
          </div>
        </div>

        {/* ── Panel 2: Code or Preview (tabbed) ── */}
        <div style={{ flex: midSplit, minWidth: 0, background: "var(--bg-secondary)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, opacity: activeTab === "code" ? 1 : 0, pointerEvents: activeTab === "code" ? "auto" : "none", zIndex: activeTab === "code" ? 1 : 0 }}>
            <CodePanel code={code} onChange={setCode} isStreaming={isGenerating} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: activeTab === "preview" ? 1 : 0, pointerEvents: activeTab === "preview" ? "auto" : "none", zIndex: activeTab === "preview" ? 1 : 0 }}>
            <PreviewPanel code={code} />
          </div>
        </div>

        {/* ── Divider M (between panels 2 & 3) ── */}
        <div
          onMouseDown={e => startDrag(e, "M")}
          style={{
            width: 4, flexShrink: 0, background: "var(--border)",
            cursor: "col-resize", transition: "background 0.15s",
            position: "relative",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-blue)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
        >
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6 }} />)}
          </div>
        </div>

        {/* ── Panel 3: Preview or Code (the other one) ── */}
        <div style={{ flex: 1 - midSplit, minWidth: 0, background: "var(--bg-secondary)", overflow: "hidden" }}>
          {activeTab === "preview" ? (
            <CodePanel code={code} onChange={setCode} isStreaming={isGenerating} />
          ) : (
            <PreviewPanel code={code} />
          )}
        </div>

        {/* ── Divider R ── */}
        <div
          onMouseDown={e => startDrag(e, "R")}
          style={{
            width: 4, flexShrink: 0, background: "var(--border)",
            cursor: "col-resize", transition: "background 0.15s",
            position: "relative",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-blue)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
        >
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6 }} />)}
          </div>
        </div>

        {/* ── Panel 4: AI Chat ── */}
        <div style={{ width: rightW, flexShrink: 0, background: "var(--bg-secondary)", overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <ChatPanel
            messages={chatMessages}
            onSend={handleChatSend}
            onApplyCode={handleApplyCode}
            isLoading={isChatLoading}
            hasCode={!!code}
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
