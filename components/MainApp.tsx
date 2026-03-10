"use client";

import { useState, useCallback, useEffect } from "react";
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
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    setIsGenerating(true);
    setCode(""); // Clear previous code
    setChatMessages([]);
    setActiveTab("code"); // Switch to code tab so user sees it stream in

    try {
      const res = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, apiKey }),
      });

      // Handle non-streaming error responses (JSON)
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Lỗi tạo game", "error");
        return;
      }

      // ── Stream reading ──────────────────────────────────────────
      const reader = res.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Check for stream error signal
        if (chunk.includes("__STREAM_ERROR__:")) {
          const errMsg = chunk.split("__STREAM_ERROR__:")[1] || "Lỗi stream";
          showToast(`Lỗi: ${errMsg}`, "error");
          break;
        }

        accumulated += chunk;

        // Strip leading markdown fences from the accumulated buffer
        const cleaned = accumulated
          .replace(/^```html?\s*/i, "")
          .replace(/^```\s*/i, "");

        setCode(cleaned);
      }

      // Final cleanup of trailing backtick fence
      setCode(prev => prev.replace(/\s*```\s*$/, "").trim());

      // Switch to preview once streaming completes (if valid HTML)
      if (accumulated.toLowerCase().includes("<!doctype html")) {
        showToast("Game đã được tạo thành công! 🎉", "success");
        setTimeout(() => setActiveTab("preview"), 600);
      } else {
        showToast("AI không trả về HTML hợp lệ. Hãy thử lại.", "error");
        setCode("");
      }
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

      // ── Parse [REPLY] and [CODE]...[/CODE] delimiters ─────────────
      // Extract reply text
      const replyMatch = fullText.match(/\[REPLY\]([\s\S]*?)(?=\[CODE\]|$)/i);
      const replyText = replyMatch ? replyMatch[1].trim() : fullText.trim();

      // Extract code block
      const codeMatch = fullText.match(/\[CODE\]([\s\S]*?)\[\/CODE\]/i);
      let patchedCode: string | null = null;
      if (codeMatch) {
        patchedCode = codeMatch[1].trim()
          .replace(/^```html?\s*/i, "")
          .replace(/\s*```\s*$/, "")
          .trim();
        // Validate it's actually HTML
        if (!patchedCode.toLowerCase().includes("<!doctype html")) {
          patchedCode = null;
        }
      }

      // Check for stream error
      if (fullText.includes("__CHAT_ERROR__:")) {
        const errMsg = fullText.split("__CHAT_ERROR__:")[1]?.split("\n")[0] || "Lỗi AI";
        setChatMessages(prev => [...prev, { role: "assistant", content: `❌ Lỗi AI: ${errMsg}` }]);
        return;
      }

      const hasCodeUpdate = !!patchedCode;
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: replyText || "Đã xử lý yêu cầu.",
        hasCodeUpdate,
      }]);

      if (patchedCode) {
        setCode(patchedCode);
        showToast("Code đã được cập nhật! ✨", "success");
      }
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
            <Sparkles size={9} /> gemini-2.0-flash
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

      {/* Main layout: 4 panels */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr 1fr 280px", gridTemplateRows: "100%", overflow: "hidden", gap: 1, background: "var(--border)" }}>
        
        {/* Panel 1: Input */}
        <div style={{ background: "var(--bg-secondary)", overflow: "hidden", height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        {/* Panel 2: Code or Preview (tabbed) */}
        <div style={{ background: "var(--bg-secondary)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, opacity: activeTab === "code" ? 1 : 0, pointerEvents: activeTab === "code" ? "auto" : "none", zIndex: activeTab === "code" ? 1 : 0 }}>
            <CodePanel code={code} onChange={setCode} isStreaming={isGenerating} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: activeTab === "preview" ? 1 : 0, pointerEvents: activeTab === "preview" ? "auto" : "none", zIndex: activeTab === "preview" ? 1 : 0 }}>
            <PreviewPanel code={code} />
          </div>
        </div>

        {/* Panel 3: The other panel (preview or code – always visible on wider screens) */}
        <div style={{ background: "var(--bg-secondary)", overflow: "hidden" }}>
          {activeTab === "preview" ? (
            <CodePanel code={code} onChange={setCode} isStreaming={isGenerating} />
          ) : (
            <PreviewPanel code={code} />
          )}
        </div>

        {/* Panel 4: AI Chat */}
        <div style={{ background: "var(--bg-secondary)", overflow: "hidden" }}>
          <ChatPanel
            messages={chatMessages}
            onSend={handleChatSend}
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
