"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Loader2, WandSparkles, Trash2 } from "lucide-react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  hasCodeUpdate?: boolean;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  hasCode: boolean;
}

const QUICK_PROMPTS = [
  "Thêm hiệu ứng âm thanh khi trả lời đúng",
  "Thay đổi màu nền thành gradient xanh-tím",
  "Thêm bảng xếp hạng điểm cao",
  "Tăng kích thước chữ cho dễ đọc hơn",
  "Thêm nút bỏ qua câu hỏi",
  "Hiển thị giải thích đáp án sau mỗi câu",
];

export default function ChatPanel({ messages, onSend, isLoading, hasCode }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput("");
    await onSend(msg);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-secondary)" }}>
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #3a1a5c, #a371f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <WandSparkles size={14} color="white" />
          </span>
          AI Chat & Debug
        </div>
        {messages.length > 0 && (
          <span className="badge badge-blue">{messages.length} tin nhắn</span>
        )}
      </div>

      {/* Messages */}
      <div className="scroll-area" style={{ flex: 1, padding: "12px 12px 8px" }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 16px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
              background: "linear-gradient(135deg, rgba(163,113,247,0.2), rgba(56,139,253,0.2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(163,113,247,0.3)",
            }}>
              <Bot size={24} color="#a371f7" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              AI Debug Assistant
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Sau khi tạo game, bạn có thể yêu cầu AI chỉnh sửa, thêm tính năng, hoặc sửa lỗi.
            </div>

            {hasCode && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 10, fontWeight: 600 }}>
                  GỢI Ý NHANH:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(p); inputRef.current?.focus(); }}
                      style={{
                        padding: "8px 12px", borderRadius: 8, textAlign: "left",
                        background: "var(--bg-tertiary)", border: "1px solid var(--border)",
                        color: "var(--text-secondary)", cursor: "pointer", fontSize: 12,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(163,113,247,0.5)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} className="fade-in" style={{ display: "flex", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #1f6feb, #388bfd)"
                    : "linear-gradient(135deg, #3a1a5c, #a371f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {msg.role === "user" ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                </div>

                {/* Bubble */}
                <div
                  className={msg.role === "user" ? "chat-message-user" : "chat-message-ai"}
                  style={{ maxWidth: "85%", padding: "10px 13px", fontSize: 13, lineHeight: 1.6 }}
                >
                  {msg.content}
                  {msg.hasCodeUpdate && (
                    <div style={{
                      marginTop: 8, padding: "4px 8px", borderRadius: 5,
                      background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)",
                      fontSize: 11, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 5,
                    }}>
                      ✅ Code đã được cập nhật
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="fade-in" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "linear-gradient(135deg, #3a1a5c, #a371f7)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Bot size={14} color="white" />
                </div>
                <div className="chat-message-ai" style={{ padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)" }}>
        {!hasCode && (
          <div style={{
            fontSize: 12, color: "var(--text-muted)", textAlign: "center",
            padding: "6px", marginBottom: 8,
          }}>
            💡 Tạo game trước, sau đó chat để chỉnh sửa
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasCode ? "Yêu cầu chỉnh sửa game... (Enter để gửi)" : "Tạo game trước..."}
            disabled={!hasCode || isLoading}
            rows={2}
            className="input-field"
            style={{ flex: 1, resize: "none", minHeight: 44, fontSize: 13 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !hasCode || isLoading}
            style={{
              width: 40, height: 40, borderRadius: 10, border: "none",
              background: (!input.trim() || !hasCode || isLoading) ? "var(--bg-tertiary)" : "linear-gradient(135deg, #7c3aed, #a371f7)",
              color: (!input.trim() || !hasCode || isLoading) ? "var(--text-muted)" : "white",
              cursor: (!input.trim() || !hasCode || isLoading) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
            }}
          >
            {isLoading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
