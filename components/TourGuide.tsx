"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { HelpCircle, X, ChevronRight, ChevronLeft } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  desc: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "tour-template",
    title: "1️⃣ Chọn Template Trò Chơi",
    desc: "Có 8 loại game để chọn: Vòng Quay, RPG, Kéo Co, Chinh Phục Lãnh Thổ, Leo Núi… Mỗi game có cơ chế khác nhau, phù hợp với từng mục đích dạy học.",
    position: "right",
  },
  {
    target: "tour-topic",
    title: "2️⃣ Nhập Chủ Đề Bài Học",
    desc: 'Nhập chủ đề cụ thể. Ví dụ: "Hoá học hữu cơ lớp 11", "Lịch sử Việt Nam thế kỷ 20", "Từ vựng Tiếng Anh chủ đề du lịch". AI sẽ tự sinh câu hỏi phù hợp.',
    position: "right",
  },
  {
    target: "tour-generate",
    title: "3️⃣ Tạo Game Với AI",
    desc: "Nhấn nút này — AI sẽ sinh câu hỏi trắc nghiệm và tạo game hoàn chỉnh trong vài giây. Không cần soạn câu hỏi thủ công!",
    position: "right",
  },
  {
    target: "tour-preview",
    title: "4️⃣ Xem & Chơi Thử Game",
    desc: "Game hiển thị ngay tại đây. Nhấn ▶ Play để chơi thử trong trình duyệt. Chia sẻ link Netlify cho học sinh để chơi trực tiếp.",
    position: "bottom",
  },
  {
    target: "tour-players",
    title: "5️⃣ Chọn Số Người Chơi",
    desc: "Chọn 1–4 người chơi. Khi chọn 2+ người, có thể đặt tên cho từng người. Phù hợp chơi hotseat 2 đội ngay trên 1 máy!",
    position: "left",
  },
  {
    target: "tour-editor",
    title: "6️⃣ Chỉnh Sửa Câu Hỏi",
    desc: "Xem toàn bộ câu hỏi AI tạo ra, sửa nội dung, thêm/xoá câu, tải file Excel mẫu, hoặc upload file Word có đáp án để AI trích xuất. Nhấn 'Áp Dụng Vào Game' để cập nhật!",
    position: "left",
  },
];

const PAD = 12;
const TOOLTIP_W = 300;
const TOOLTIP_H_ESTIMATE = 190;
const MAX_RETRIES = 6;
const RETRY_DELAY = 80; // ms between retries

interface SpotlightRect { x: number; y: number; width: number; height: number; }

/** Try to find element and return its viewport rect, clamped for SVG */
function getElementRect(id: string): SpotlightRect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null; // hidden/collapsed
  return {
    x: Math.max(0, r.left - PAD),
    y: Math.max(0, r.top - PAD),
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

/** Returns a centred fallback rect so tour never goes blank */
function centreRect(): SpotlightRect {
  if (typeof window === "undefined") return { x: 400, y: 300, width: 400, height: 60 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = 400, h = 60;
  return { x: vw / 2 - w / 2, y: vh / 2 - h / 2, width: w, height: h };
}

// ── Tooltip ─────────────────────────────────────────────────────
function Tooltip({ step, rect, current, total, onNext, onPrev, onClose }: {
  step: TourStep; rect: SpotlightRect; current: number; total: number;
  onNext: () => void; onPrev: () => void; onClose: () => void;
}) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const prefer = step.position || "bottom";

  let top = 0, left = 0;

  if (prefer === "right") {
    left = rect.x + rect.width + 16;
    top = rect.y + rect.height / 2 - TOOLTIP_H_ESTIMATE / 2;
  } else if (prefer === "left") {
    left = rect.x - TOOLTIP_W - 16;
    top = rect.y + rect.height / 2 - TOOLTIP_H_ESTIMATE / 2;
  } else if (prefer === "top") {
    left = rect.x + rect.width / 2 - TOOLTIP_W / 2;
    top = rect.y - TOOLTIP_H_ESTIMATE - 16;
  } else {
    left = rect.x + rect.width / 2 - TOOLTIP_W / 2;
    top = rect.y + rect.height + 16;
  }

  // Overflow guards — push back into viewport
  if (left + TOOLTIP_W > vw - 8) left = rect.x - TOOLTIP_W - 16;
  if (left < 8) left = rect.x + rect.width + 16;
  left = Math.max(8, Math.min(left, vw - TOOLTIP_W - 8));
  top = Math.max(8, Math.min(top, vh - TOOLTIP_H_ESTIMATE - 8));

  return (
    <div
      style={{
        position: "fixed", top, left, width: TOOLTIP_W, zIndex: 10010,
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "1px solid rgba(99,102,241,.6)", borderRadius: 16,
        padding: "18px 18px 14px",
        boxShadow: "0 20px 60px rgba(0,0,0,.85), 0 0 0 1px rgba(99,102,241,.2)",
        animation: "tour-fade 0.2s ease",
        pointerEvents: "auto",
      }}
      // stop click from bubbling to overlay
      onClick={e => e.stopPropagation()}
    >
      {/* Step counter + dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: ".08em",
          color: "#818cf8", background: "rgba(99,102,241,.18)",
          border: "1px solid rgba(99,102,241,.35)", borderRadius: 20, padding: "3px 10px",
        }}>
          BƯỚC {current}/{total}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i === current - 1 ? 14 : 6, height: 6, borderRadius: 3,
              background: i === current - 1 ? "#6366f1" : "rgba(255,255,255,.15)",
              transition: "all .25s",
            }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", marginBottom: 8, lineHeight: 1.35 }}>
        {step.title}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65, marginBottom: 14 }}>
        {step.desc}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onClose} style={{
          fontSize: 11, color: "#475569", background: "none", border: "none",
          cursor: "pointer", padding: "5px 0", marginRight: "auto", textDecoration: "underline",
        }}>Bỏ qua</button>

        {current > 1 && (
          <button onClick={onPrev} style={{
            padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.06)", color: "#94a3b8",
            cursor: "pointer", fontSize: 11, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <ChevronLeft size={12} /> Trước
          </button>
        )}

        <button onClick={onNext} style={{
          padding: "7px 14px", borderRadius: 8, border: "none",
          background: current === total
            ? "linear-gradient(135deg, #10b981, #34d399)"
            : "linear-gradient(135deg, #6366f1, #818cf8)",
          color: "white", cursor: "pointer", fontSize: 11, fontWeight: 800,
          display: "flex", alignItems: "center", gap: 4,
          boxShadow: "0 4px 12px rgba(99,102,241,.4)",
        }}>
          {current === total ? "Hoàn thành 🎉" : (<>Tiếp <ChevronRight size={12} /></>)}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function TourGuide({ autoShow = true }: { autoShow?: boolean }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<SpotlightRect>(centreRect());
  const [vwvh, setVwvh] = useState({ vw: 1200, vh: 800 });
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise vw/vh on client
  useEffect(() => {
    setVwvh({ vw: window.innerWidth, vh: window.innerHeight });
  }, []);

  // ── Robust rect resolver: retries up to MAX_RETRIES times ──────
  const resolveRect = useCallback((stepIdx: number, attempt = 0) => {
    if (retryRef.current) clearTimeout(retryRef.current);

    const target = TOUR_STEPS[stepIdx]?.target;
    if (!target) return;

    const r = getElementRect(target);
    if (r) {
      setRect(r);
      setVwvh({ vw: window.innerWidth, vh: window.innerHeight });
    } else if (attempt < MAX_RETRIES) {
      // Retry after a short delay
      retryRef.current = setTimeout(() => resolveRect(stepIdx, attempt + 1), RETRY_DELAY);
    } else {
      // After all retries, use a centred fallback but keep tour alive
      setRect(centreRect());
      setVwvh({ vw: window.innerWidth, vh: window.innerHeight });
    }
  }, []);

  const startTour = useCallback(() => {
    setStep(0);
    setActive(true);
    // Small delay to let React commit the DOM
    setTimeout(() => resolveRect(0), 80);
  }, [resolveRect]);

  // Auto-show on first visit
  useEffect(() => {
    if (!autoShow) return;
    if (!localStorage.getItem("edugame_tour_done")) {
      const t = setTimeout(startTour, 900);
      return () => clearTimeout(t);
    }
  }, [autoShow, startTour]);

  // Resolve rect every time step changes
  useEffect(() => {
    if (!active) return;
    resolveRect(step);
    return () => { if (retryRef.current) clearTimeout(retryRef.current); };
  }, [active, step, resolveRect]);

  // Update on resize
  useEffect(() => {
    if (!active) return;
    const onResize = () => resolveRect(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, resolveRect]);

  function goNext() {
    if (step >= TOUR_STEPS.length - 1) closeTour();
    else setStep(s => s + 1);
  }
  function goPrev() { if (step > 0) setStep(s => s - 1); }
  function closeTour() {
    setActive(false);
    if (retryRef.current) clearTimeout(retryRef.current);
    localStorage.setItem("edugame_tour_done", "1");
  }

  return (
    <>
      {/* Help button */}
      <button
        onClick={startTour}
        title="Hướng dẫn sử dụng"
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 11px",
          borderRadius: 7, background: "rgba(99,102,241,.12)",
          border: "1px solid rgba(99,102,241,.4)",
          color: "#818cf8", cursor: "pointer", fontSize: 12, fontWeight: 600,
          transition: "all .15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,.25)";
          (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,.12)";
          (e.currentTarget as HTMLButtonElement).style.color = "#818cf8";
        }}
      >
        <HelpCircle size={13} /> Hướng dẫn
      </button>

      {/* Tour overlay — only mounted when active, never gated by rect */}
      {active && (
        <>
          {/* SVG spotlight */}
          <svg
            style={{
              position: "fixed", inset: 0, zIndex: 10005,
              width: "100vw", height: "100vh",
              pointerEvents: "none",
            }}
            width={vwvh.vw} height={vwvh.vh}
          >
            <defs>
              <mask id="tour-mask" maskUnits="userSpaceOnUse">
                <rect width={vwvh.vw} height={vwvh.vh} fill="white" />
                <rect
                  x={rect.x} y={rect.y}
                  width={rect.width} height={rect.height}
                  rx={10} ry={10}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width={vwvh.vw} height={vwvh.vh}
              fill="rgba(4,7,18,0.82)"
              mask="url(#tour-mask)"
            />
            <rect
              x={rect.x} y={rect.y}
              width={rect.width} height={rect.height}
              rx={10} ry={10}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              opacity={0.9}
            />
          </svg>

          {/* Overlay click-catcher — behind tooltip */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10006, cursor: "default" }}
            onClick={closeTour}
          />

          {/* Tooltip (higher z-index, stopPropagation inside) */}
          <div style={{ position: "fixed", inset: 0, zIndex: 10007, pointerEvents: "none" }}>
            <Tooltip
              step={TOUR_STEPS[step]}
              rect={rect}
              current={step + 1}
              total={TOUR_STEPS.length}
              onNext={goNext}
              onPrev={goPrev}
              onClose={closeTour}
            />
          </div>

          {/* Close × */}
          <button
            onClick={closeTour}
            style={{
              position: "fixed", top: 12, right: 12, zIndex: 10008,
              background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)",
              borderRadius: "50%", width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#94a3b8",
            }}
          >
            <X size={14} />
          </button>
        </>
      )}

      <style>{`
        @keyframes tour-fade {
          from { opacity: 0; transform: translateY(6px) scale(.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
