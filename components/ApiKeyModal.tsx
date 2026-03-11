"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, X, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export default function ApiKeyModal({ isOpen, onClose, onSave, currentKey }: ApiKeyModalProps) {
  const [key, setKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setKey(currentKey);
      setTestResult(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentKey]);

  async function handleTestAndSave() {
    if (!key.trim()) {
      setTestResult({ valid: false, message: "Vui lòng nhập API key." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.valid) {
        onSave(key.trim());
        setTimeout(onClose, 1500);
      }
    } catch {
      setTestResult({ valid: false, message: "Không thể kết nối đến server. Kiểm tra kết nối mạng." });
    } finally {
      setTesting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card fade-in"
        style={{ width: 520, padding: 28, position: "relative", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, rgba(56,139,253,0.3), rgba(163,113,247,0.3))",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(56,139,253,0.3)",
          }}>
            <KeyRound size={18} color="#388bfd" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Cấu hình Gemini API Key
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              Lấy key miễn phí tại{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
                style={{ color: "var(--accent-blue)", textDecoration: "none" }}>
                aistudio.google.com
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 6,
              display: "flex", alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
            API KEY
          </label>
          <div style={{ position: "relative" }}>
            <input
              ref={inputRef}
              type={showKey ? "text" : "password"}
              className="input-field code-font"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIza..."
              style={{ paddingRight: 40 }}
              onKeyDown={(e) => e.key === "Enter" && handleTestAndSave()}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", display: "flex", alignItems: "center",
              }}
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            API key được lưu trong localStorage của trình duyệt. Không chia sẻ với ai.
          </p>
        </div>

        {/* Video tutorial */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            🎥 HƯỚNG DẪN LẤY API KEY
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "#000" }}>
            <video
              src="https://www.luonghaianhchemcnt.edu.vn/wp-content/uploads/2025/12/Huong-dan-lay-APIKEY.mp4"
              controls
              preload="none"
              style={{ width: "100%", maxHeight: 200, display: "block" }}
            />
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 8, padding: "9px 12px", borderRadius: 8,
              background: "linear-gradient(135deg, rgba(56,139,253,.2), rgba(163,113,247,.2))",
              border: "1px solid rgba(56,139,253,.35)",
              color: "var(--accent-blue)", textDecoration: "none",
              fontSize: 12, fontWeight: 700, transition: "all .15s",
            }}
          >
            🔑 Lấy API Key miễn phí tại Google AI Studio ↗
          </a>
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className="fade-in"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: testResult.valid
                ? "rgba(63, 185, 80, 0.1)"
                : "rgba(248, 81, 73, 0.1)",
              border: `1px solid ${testResult.valid ? "rgba(63,185,80,0.3)" : "rgba(248,81,73,0.3)"}`,
              color: testResult.valid ? "var(--accent-green)" : "var(--accent-red)",
              fontSize: 13,
            }}
          >
            {testResult.valid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {testResult.message}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px", borderRadius: 8,
              background: "var(--bg-tertiary)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, fontWeight: 500,
            }}
          >
            Hủy
          </button>
          <button
            className="btn-glow"
            onClick={handleTestAndSave}
            disabled={testing}
            style={{ flex: 2 }}
          >
            {testing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <span className="spinner" style={{ width: 14, height: 14 }} /> Đang kiểm tra...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Settings size={14} /> Test & Lưu
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
