"use client";

import { useRef, useEffect, useState } from "react";
import { Monitor, RefreshCw, AlertCircle, Maximize2, Gamepad2 } from "lucide-react";

interface PreviewPanelProps {
  code: string;
}

interface ConsoleError {
  message: string;
  time: string;
}

export default function PreviewPanel({ code }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [errors, setErrors] = useState<ConsoleError[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Inject error listener into the iframe
  const buildSrcDoc = (rawCode: string): string => {
    const errorCapture = `
<script>
window.onerror = function(msg, src, line, col, err) {
  window.parent.postMessage({ type: 'consoleError', message: msg + ' (Line ' + line + ')' }, '*');
};
window.addEventListener('unhandledrejection', function(e) {
  window.parent.postMessage({ type: 'consoleError', message: 'Promise error: ' + (e.reason?.message || e.reason) }, '*');
});
<\/script>`;
    // Insert error capture script right after <head> if it exists, else prepend
    if (rawCode.includes("<head>")) {
      return rawCode.replace("<head>", "<head>" + errorCapture);
    }
    return errorCapture + rawCode;
  };

  // Listen for errors from iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "consoleError") {
        const now = new Date().toLocaleTimeString("vi-VN");
        setErrors(prev => [...prev.slice(-9), { message: e.data.message, time: now }]);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Reset errors on new code
  useEffect(() => {
    setErrors([]);
  }, [code]);

  function handleRefresh() {
    setErrors([]);
    setRefreshKey(k => k + 1);
  }

  const srcDoc = code ? buildSrcDoc(code) : "";

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg-secondary)",
      position: isFullscreen ? "fixed" : "relative",
      inset: isFullscreen ? 0 : "auto",
      zIndex: isFullscreen ? 9998 : "auto",
    }}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #1a4a1a, #3fb950)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Monitor size={14} color="white" />
          </span>
          Live Preview
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {errors.length > 0 && (
            <span className="badge badge-red">
              <AlertCircle size={10} /> {errors.length} lỗi
            </span>
          )}
          {code && <span className="badge badge-green">● Live</span>}

          <button
            onClick={handleRefresh}
            title="Làm mới preview"
            style={{
              padding: "5px", borderRadius: 6, background: "var(--bg-tertiary)",
              border: "1px solid var(--border)", color: "var(--text-secondary)",
              cursor: "pointer", display: "flex", alignItems: "center",
            }}
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
            style={{
              padding: "5px", borderRadius: 6, background: "var(--bg-tertiary)",
              border: "1px solid var(--border)", color: "var(--text-secondary)",
              cursor: "pointer", display: "flex", alignItems: "center",
            }}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div style={{ flex: 1, position: "relative", background: "#fff" }}>
        {!code ? (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
            background: "var(--bg-primary)",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: "var(--bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px dashed var(--border)",
            }}>
              <Gamepad2 size={36} color="var(--border)" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Preview trống
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 220 }}>
                Tạo game để xem preview trực tiếp ở đây
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={`preview-${refreshKey}`}
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            title="Game Preview"
          />
        )}
      </div>

      {/* Error console */}
      {errors.length > 0 && (
        <div style={{
          padding: "8px 12px", background: "rgba(248,81,73,0.08)",
          borderTop: "1px solid rgba(248,81,73,0.2)",
          maxHeight: 100, overflowY: "auto",
        }}>
          <div style={{ fontSize: 11, color: "var(--accent-red)", fontWeight: 600, marginBottom: 4 }}>
            🐛 Console Errors
          </div>
          {errors.map((err, i) => (
            <div key={i} className="code-font" style={{ fontSize: 11, color: "#f87171", padding: "2px 0" }}>
              <span style={{ color: "var(--text-muted)" }}>[{err.time}]</span> {err.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
