"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Download, Check, Code2, FileCode, RefreshCw } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodePanelProps {
  code: string;
  onChange: (code: string) => void;
  isStreaming?: boolean;
}

export default function CodePanel({ code, onChange, isStreaming }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<unknown>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for HTTP pages
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    const blob = new Blob([code], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edugame.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFormat() {
    // Basic HTML formatting - just triggers editor layout refresh
    if (editorRef.current) {
      // @ts-expect-error monaco editor action
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  }

  const lineCount = code ? code.split("\n").length : 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-secondary)" }}>
      {/* Header */}
      <div className="panel-header" style={{ gap: 8 }}>
        <div className="panel-title">
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #1a3a5c, #388bfd)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Code2 size={14} color="white" />
          </span>
          Code Editor
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {code && (
            <span className="badge badge-blue" style={{ fontSize: 10 }}>
              <FileCode size={10} /> {lineCount} dòng
            </span>
          )}
          {isStreaming && (
            <span className="fade-in" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: "rgba(56,139,253,0.15)",
              border: "1px solid rgba(56,139,253,0.4)",
              color: "var(--accent-blue)",
              animation: "pulse-glow 1.2s ease-in-out infinite",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-blue)",
                animation: "pulse-glow 0.8s ease-in-out infinite" }} />
              ⚡ Đang stream...
            </span>
          )}

          <button
            onClick={handleFormat}
            disabled={!code}
            title="Format code"
            style={{
              padding: "5px 9px", borderRadius: 6, background: "var(--bg-tertiary)",
              border: "1px solid var(--border)", color: "var(--text-secondary)",
              cursor: code ? "pointer" : "not-allowed", fontSize: 11, display: "flex",
              alignItems: "center", gap: 4, opacity: code ? 1 : 0.5,
            }}
          >
            <RefreshCw size={11} /> Format
          </button>

          <button
            onClick={handleCopy}
            disabled={!code}
            title="Copy code"
            style={{
              padding: "5px 9px", borderRadius: 6, background: "var(--bg-tertiary)",
              border: "1px solid var(--border)", color: copied ? "var(--accent-green)" : "var(--text-secondary)",
              cursor: code ? "pointer" : "not-allowed", fontSize: 11, display: "flex",
              alignItems: "center", gap: 4, transition: "color 0.2s", opacity: code ? 1 : 0.5,
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Đã copy!" : "Copy"}
          </button>

          <button
            onClick={handleDownload}
            disabled={!code}
            title="Tải xuống HTML"
            style={{
              padding: "5px 10px", borderRadius: 6,
              background: code ? "linear-gradient(135deg, #1f6feb, #388bfd)" : "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              color: code ? "white" : "var(--text-muted)",
              cursor: code ? "pointer" : "not-allowed", fontSize: 11, display: "flex",
              alignItems: "center", gap: 4, fontWeight: 600, opacity: code ? 1 : 0.5,
            }}
          >
            <Download size={11} /> Tải HTML
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, position: "relative" }}>
        {!code ? (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
            color: "var(--text-muted)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "var(--bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px dashed var(--border)",
            }}>
              <FileCode size={28} color="var(--border)" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                Chưa có code
              </div>
              <div style={{ fontSize: 12 }}>Tạo game để xem code HTML</div>
            </div>
          </div>
        ) : (
          <MonacoEditor
            height="100%"
            language="html"
            theme="vs-dark"
            value={code}
            onChange={(val) => onChange(val || "")}
            onMount={(editor) => { editorRef.current = editor; }}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              minimap: { enabled: true, scale: 0.7 },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              folding: true,
              tabSize: 2,
              automaticLayout: true,
              smoothScrolling: true,
              cursorSmoothCaretAnimation: "on",
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
            }}
          />
        )}
      </div>
    </div>
  );
}
