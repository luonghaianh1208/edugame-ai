"use client";

import { Gamepad2, Eye, FileEdit, X, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";

export type MobilePanel = "input" | "preview" | "editor";

interface MobileNavProps {
  activePanel: MobilePanel;
  onSwitch: (panel: MobilePanel) => void;
  hasGame: boolean;
}

const TABS: { key: MobilePanel; icon: React.ReactNode; label: string }[] = [
  { key: "input",   icon: <Gamepad2 size={18} />,  label: "Tạo Game" },
  { key: "preview", icon: <Eye size={18} />,        label: "Xem Game" },
  { key: "editor",  icon: <FileEdit size={18} />,   label: "Câu hỏi" },
];

export default function MobileNav({ activePanel, onSwitch, hasGame }: MobileNavProps) {
  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      zIndex: 1000,
      background: "rgba(10,14,28,0.97)",
      backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(255,255,255,.08)",
      display: "flex",
      alignItems: "stretch",
      height: 60,
      // iOS safe area
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {TABS.map(tab => {
        const active = activePanel === tab.key;
        const disabled = tab.key !== "input" && !hasGame;
        return (
          <button
            key={tab.key}
            onClick={() => !disabled && onSwitch(tab.key)}
            style={{
              flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              border: "none",
              background: "transparent",
              cursor: disabled ? "not-allowed" : "pointer",
              position: "relative",
              opacity: disabled ? 0.35 : 1,
              transition: "all .15s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Active indicator line at top */}
            {active && (
              <div style={{
                position: "absolute", top: 0, left: "20%", right: "20%",
                height: 2,
                background: "linear-gradient(90deg, #6366f1, #818cf8)",
                borderRadius: "0 0 2px 2px",
              }} />
            )}
            <span style={{ color: active ? "#818cf8" : "#475569", transition: "color .15s" }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? "#818cf8" : "#475569",
              transition: "color .15s",
              letterSpacing: ".01em",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Sidebar Collapse Toggle Button ────────────────────────────────
interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function SidebarToggle({ collapsed, onToggle, isMobile }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 7,
        border: "1px solid var(--border)",
        background: "var(--bg-tertiary)",
        color: "var(--text-muted)",
        cursor: "pointer",
        flexShrink: 0,
        transition: "all .15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,.15)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-blue)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-tertiary)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
      }}
    >
      {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
    </button>
  );
}

// ── Mobile Drawer Overlay ─────────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  from?: "left" | "right";
}

export function Drawer({ open, onClose, children, width = 300, from = "left" }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,.6)",
            backdropFilter: "blur(2px)",
            animation: "fade-in .2s ease",
          }}
        />
      )}
      {/* Drawer panel */}
      <div style={{
        position: "fixed",
        top: 0, bottom: 0,
        [from]: 0,
        width,
        zIndex: 501,
        background: "var(--bg-secondary)",
        borderRight: from === "left" ? "1px solid var(--border)" : "none",
        borderLeft: from === "right" ? "1px solid var(--border)" : "none",
        transform: open ? "translateX(0)" : `translateX(${from === "left" ? "-100%" : "100%"})`,
        transition: "transform .28s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Close strip */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            [from === "left" ? "right" : "left"]: 12,
            zIndex: 1,
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
            color: "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={13} />
        </button>
        {children}
      </div>
    </>
  );
}

export { Menu };
