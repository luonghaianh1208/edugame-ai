"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { HelpCircle, X, ChevronRight, ChevronLeft } from "lucide-react";

interface TourStep {
  target: string;       // element ID to spotlight
  title: string;
  desc: string;
  position?: "top" | "bottom" | "left" | "right"; // tooltip side preference
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

const PAD = 12; // spotlight padding around element
const TOOLTIP_W = 300;

interface Rect { x: number; y: number; width: number; height: number; }

function getRect(id: string): Rect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left - PAD, y: r.top - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

function Tooltip({ step, rect, current, total, onNext, onPrev, onClose }: {
  step: TourStep; rect: Rect; current: number; total: number;
  onNext: () => void; onPrev: () => void; onClose: () => void;
}) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const prefer = step.position || "bottom";

  // Compute tooltip position
  let top = 0, left = 0;
  const TH = 160; // estimated tooltip height

  if (prefer === "right" || (prefer === "bottom" && rect.x + rect.width + TOOLTIP_W + 16 < vw)) {
    // right side
    left = rect.x + rect.width + 16;
    top = rect.y + rect.height / 2 - TH / 2;
  } else if (prefer === "left") {
    left = rect.x - TOOLTIP_W - 16;
    top = rect.y + rect.height / 2 - TH / 2;
  } else if (prefer === "top") {
    left = rect.x + rect.width / 2 - TOOLTIP_W / 2;
    top = rect.y - TH - 16;
  } else {
    // bottom (default)
    left = rect.x + rect.width / 2 - TOOLTIP_W / 2;
    top = rect.y + rect.height + 16;
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));
  top = Math.max(12, Math.min(top, vh - TH - 12));

  return (
    <div style={{
      position: "fixed",
      top,
      left,
      width: TOOLTIP_W,
      zIndex: 10002,
      background: "linear-gradient(135deg, #1e293b, #0f172a)",
      border: "1px solid rgba(99,102,241,.6)",
      borderRadius: 16,
      padding: "18px 18px 14px",
      boxShadow: "0 20px 60px rgba(0,0,0,.8), 0 0 0 1px rgba(99,102,241,.2)",
      animation: "tour-fade 0.25s ease",
    }}>
      {/* Step counter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: ".08em",
          color: "var(--accent-blue)", background: "rgba(99,102,241,.15)",
          border: "1px solid rgba(99,102,241,.3)", borderRadius: 20,
          padding: "3px 10px",
        }}>
          BƯỚC {current}/{total}
        </span>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i === current - 1 ? 14 : 6, height: 6,
              borderRadius: 3,
              background: i === current - 1 ? "#6366f1" : "rgba(255,255,255,.15)",
              transition: "all .25s",
            }} />
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", marginBottom: 8, lineHeight: 1.3 }}>
        {step.title}
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14 }}>
        {step.desc}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={onClose}
          style={{
            fontSize: 11, color: "#475569", background: "none", border: "none",
            cursor: "pointer", padding: "5px 0", marginRight: "auto",
            textDecoration: "underline",
          }}
        >Bỏ qua</button>

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

interface TourGuideProps {
  autoShow?: boolean;
}

export default function TourGuide({ autoShow = true }: TourGuideProps) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  const rafRef = useRef<number | null>(null);

  const updateRect = useCallback((stepIdx: number) => {
    const target = TOUR_STEPS[stepIdx]?.target;
    if (!target) return;
    const r = getRect(target);
    setRect(r);
    setVw(window.innerWidth);
    setVh(window.innerHeight);
  }, []);

  const startTour = useCallback(() => {
    setStep(0);
    setActive(true);
    setTimeout(() => updateRect(0), 50);
  }, [updateRect]);

  // Auto-show on first visit
  useEffect(() => {
    if (!autoShow) return;
    const done = localStorage.getItem("edugame_tour_done");
    if (!done) {
      const t = setTimeout(() => startTour(), 800);
      return () => clearTimeout(t);
    }
  }, [autoShow, startTour]);

  // Update rect on resize
  useEffect(() => {
    if (!active) return;
    const onResize = () => updateRect(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, updateRect]);

  // Animate rect update when step changes
  useEffect(() => {
    if (!active) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => updateRect(step));
  }, [active, step, updateRect]);

  function goNext() {
    if (step >= TOUR_STEPS.length - 1) {
      closeTour();
    } else {
      setStep(s => s + 1);
    }
  }

  function goPrev() {
    if (step > 0) setStep(s => s - 1);
  }

  function closeTour() {
    setActive(false);
    localStorage.setItem("edugame_tour_done", "1");
  }

  return (
    <>
      {/* Help button — always visible in top-right of navbar (rendered externally via portal concept) */}
      <button
        id="tour-help-btn"
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

      {/* Tour overlay */}
      {active && rect && (
        <>
          {/* SVG dark overlay with spotlight hole */}
          <svg
            style={{
              position: "fixed", inset: 0, zIndex: 10001,
              width: "100vw", height: "100vh",
              pointerEvents: "none",
              transition: "all .3s ease",
            }}
            width={vw} height={vh}
          >
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.x} y={rect.y}
                  width={rect.width} height={rect.height}
                  rx={10} ry={10}
                  fill="black"
                />
              </mask>
            </defs>
            {/* Dark overlay with hole */}
            <rect
              width="100%" height="100%"
              fill="rgba(4,7,18,0.82)"
              mask="url(#tour-mask)"
            />
            {/* Glowing border around spotlight */}
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

          {/* Click outside to close */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10000, cursor: "pointer" }}
            onClick={closeTour}
          />

          {/* Tooltip */}
          <Tooltip
            step={TOUR_STEPS[step]}
            rect={rect}
            current={step + 1}
            total={TOUR_STEPS.length}
            onNext={goNext}
            onPrev={goPrev}
            onClose={closeTour}
          />

          {/* Close X button */}
          <button
            onClick={closeTour}
            style={{
              position: "fixed", top: 12, right: 12, zIndex: 10003,
              background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
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
          from { opacity: 0; transform: translateY(8px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
