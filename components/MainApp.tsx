"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Settings, Gamepad2, Github, Sparkles, Menu } from "lucide-react";
import InputPanel, { GameParams } from "./InputPanel";
import CodePanel from "./CodePanel";
import PreviewPanel from "./PreviewPanel";
import QuestionEditorPanel, { EditorSettings } from "./QuestionEditorPanel";
import ApiKeyModal from "./ApiKeyModal";
import TourGuide from "./TourGuide";
import MobileNav, { SidebarToggle, Drawer } from "./MobileNav";
import type { MobilePanel } from "./MobileNav";
import { GameQuestion } from "@/lib/templates/types";

interface Toast { message: string; type: "success" | "error"; }

// ── Breakpoint hook ──────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setBp(w < 768 ? "mobile" : w < 1100 ? "tablet" : "desktop");
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

export default function MainApp() {
  const bp = useBreakpoint();
  const isMobile  = bp === "mobile";
  const isTablet  = bp === "tablet";
  const isDesktop = bp === "desktop";

  // ── State ────────────────────────────────────────────────────────
  const [code, setCode]       = useState("");
  const [currentQuestions, setCurrentQuestions] = useState<GameQuestion[]>([]);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    templateId: "rpg-battle", playerMode: "1p",
    player1Name: "Người chơi 1", player2Name: "Người chơi 2",
    player3Name: "Người chơi 3", player4Name: "Người chơi 4",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying,   setIsApplying]   = useState(false);
  const [apiKey, setApiKey]             = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [toast, setToast]               = useState<Toast | null>(null);
  const [activeTab, setActiveTab]       = useState<"code" | "preview">("preview");

  // ── Responsive panel state ────────────────────────────────────────
  const [mobilePanel, setMobilePanel]   = useState<MobilePanel>("input");
  const [drawerOpen,  setDrawerOpen]    = useState(false);   // tablet input drawer
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false); // tablet editor drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar_collapsed") === "1";
  });

  function toggleSidebar() {
    setSidebarCollapsed(v => {
      const next = !v;
      localStorage.setItem("sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  }

  // ── Resizable panel widths (desktop only) ────────────────────────
  const [leftW,  setLeftW]    = useState(290);
  const [rightW, setRightW]   = useState(280);
  const [midSplit, setMidSplit] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    handle: "L" | "M" | "R"; startX: number; startVal: number; containerW: number;
  } | null>(null);

  const startDrag = useCallback((e: React.MouseEvent, handle: "L" | "M" | "R") => {
    e.preventDefault();
    const totalW = containerRef.current?.offsetWidth ?? window.innerWidth;
    dragRef.current = { handle, startX: e.clientX, startVal: handle === "L" ? leftW : handle === "R" ? rightW : midSplit, containerW: totalW };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const { handle: h, startX, startVal, containerW } = dragRef.current;
      const dx = ev.clientX - startX;
      const MIN = 160;
      if (h === "L")      setLeftW(Math.max(MIN, Math.min(startVal + dx, containerW * 0.4)));
      else if (h === "R") setRightW(Math.max(MIN, Math.min(startVal - dx, containerW * 0.4)));
      else { const midW = containerW - leftW - rightW - 6; setMidSplit(Math.max(0.15, Math.min(0.85, startVal + dx / midW))); }
    }
    function onUp() { dragRef.current = null; document.body.style.cursor = ""; document.body.style.userSelect = ""; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [leftW, rightW, midSplit]);

  // ── API Key ──────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) setApiKey(saved);
  }, []);
  const hasKey = apiKey.length > 10;

  function handleSaveKey(k: string) {
    setApiKey(k);
    localStorage.setItem("gemini_api_key", k);
  }

  // ── Toast helper ─────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Generate game ────────────────────────────────────────────────
  async function handleGenerate(params: GameParams) {
    if (!apiKey) { setShowKeyModal(true); return; }
    setIsGenerating(true);
    setCode("");
    if (isMobile) setMobilePanel("preview");
    try {
      const res = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, apiKey, playerMode: editorSettings.playerMode, player1Name: editorSettings.player1Name, player2Name: editorSettings.player2Name, player3Name: editorSettings.player3Name, player4Name: editorSettings.player4Name }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Lỗi server");
      const data = await res.json();
      setCode(data.html || "");
      if (data.questions) setCurrentQuestions(data.questions);
      setEditorSettings(s => ({ ...s, templateId: params.templateId as EditorSettings["templateId"], playerMode: (params.playerMode || "1p") as EditorSettings["playerMode"] }));
      showToast("🎮 Game đã tạo thành công!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Lỗi không xác định", "error");
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Apply to game ────────────────────────────────────────────────
  async function handleApplyToGame(questions: GameQuestion[], settings: EditorSettings) {
    if (!code) { showToast("Chưa tạo game. Vui lòng tạo game trước!", "error"); return; }
    setIsApplying(true);
    try {
      const res = await fetch("/api/rebuild-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, templateId: settings.templateId, playerMode: settings.playerMode, player1Name: settings.player1Name, player2Name: settings.player2Name, player3Name: settings.player3Name, player4Name: settings.player4Name }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Lỗi server");
      const data = await res.json();
      setCode(data.html);
      setEditorSettings(settings);
      setCurrentQuestions(questions);
      showToast("✅ Game đã cập nhật!", "success");
      if (isMobile) setMobilePanel("preview");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Lỗi cập nhật", "error");
    } finally {
      setIsApplying(false);
    }
  }

  // ── Shared panels ────────────────────────────────────────────────
  const InputPanelEl   = <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />;
  const PreviewPanelEl = (
    <div style={{ position: "absolute", inset: 0, opacity: activeTab === "preview" ? 1 : 0, pointerEvents: activeTab === "preview" ? "auto" : "none", zIndex: activeTab === "preview" ? 1 : 0 }}>
      <PreviewPanel code={code} />
    </div>
  );
  const CodePanelEl = (
    <div style={{ position: "absolute", inset: 0, opacity: activeTab === "code" ? 1 : 0, pointerEvents: activeTab === "code" ? "auto" : "none", zIndex: activeTab === "code" ? 1 : 0 }}>
      <CodePanel code={code} onChange={setCode} isStreaming={isGenerating} />
    </div>
  );
  const EditorPanelEl = (
    <QuestionEditorPanel
      questions={currentQuestions}
      editorSettings={editorSettings}
      isApplying={isApplying}
      apiKey={apiKey}
      onApply={handleApplyToGame}
      onSettingsChange={setEditorSettings}
    />
  );

  const hasGame = code.length > 0;

  // ── Divider helper ───────────────────────────────────────────────
  const Divider = ({ handle }: { handle: "L" | "M" | "R" }) => (
    <div
      onMouseDown={e => startDrag(e, handle)}
      style={{ width: 4, flexShrink: 0, background: "var(--border)", cursor: "col-resize", position: "relative", transition: "background .15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-blue)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
    >
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: 3 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 2, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.6 }} />)}
      </div>
    </div>
  );

  // ── Navbar ───────────────────────────────────────────────────────
  const Navbar = (
    <nav style={{
      height: 52, padding: "0 12px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
      flexShrink: 0, gap: 8,
    }}>
      {/* Left: hamburger (mobile/tablet) + logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
        {(isMobile || isTablet) && (
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg-tertiary)", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}
          >
            <Menu size={15} />
          </button>
        )}

        {isDesktop && <SidebarToggle collapsed={sidebarCollapsed} onToggle={toggleSidebar} />}

        {/* Logo */}
        <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,.1)" }}>
          <img src="https://www.luonghaianhchemcnt.edu.vn/wp-content/uploads/2025/09/cropped-ChatGPT-Image-00_12_51-30-thg-7-2025.png" alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>EduGame</span>
          <span style={{ fontSize: 14, fontWeight: 400, color: "var(--accent-blue)" }}>AI</span>
          {!isMobile && (
            <span className="badge badge-blue" style={{ fontSize: 9 }}>
              <Sparkles size={8} /> 2Anh AI Education
            </span>
          )}
        </div>
      </div>

      {/* Centre: code/preview tabs */}
      {!isMobile && (
        <div style={{ display: "flex", gap: 2, background: "var(--bg-tertiary)", padding: 3, borderRadius: 8, border: "1px solid var(--border)", flexShrink: 0 }}>
          {[
            { key: "preview", icon: <Gamepad2 size={12} />, label: "Preview" },
            { key: "code",    icon: <Github size={12} />,    label: "Code" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as "code" | "preview")} style={{
              padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
              background: activeTab === tab.key ? "var(--bg-secondary)" : "transparent",
              color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.15s",
              boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Right: tour + status + settings + tablet editor */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {isTablet && (
          <button
            onClick={() => setEditorDrawerOpen(true)}
            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(16,185,129,.4)", background: "rgba(16,185,129,.1)", color: "#34d399", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}
          >
            <span>📝</span> Câu hỏi
          </button>
        )}
        <TourGuide autoShow />
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: hasKey ? "var(--accent-green)" : "var(--accent-orange)", boxShadow: hasKey ? "0 0 6px var(--accent-green)" : "0 0 6px var(--accent-orange)" }} />
            <span style={{ color: "var(--text-secondary)" }}>{hasKey ? "API OK" : "Chưa có key"}</span>
          </div>
        )}
        <button
          onClick={() => setShowKeyModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
            borderRadius: 7, background: "var(--bg-tertiary)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: 11, fontWeight: 500,
          }}
        >
          <Settings size={12} />{!isMobile && " Cài đặt"}
        </button>
      </div>
    </nav>
  );

  // ════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-primary)" }}>
        {Navbar}

        {/* Fullscreen single panel */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", background: "var(--bg-secondary)", marginBottom: 60 }}>
          <div style={{ position: "absolute", inset: 0, display: mobilePanel === "input"   ? "flex" : "none", flexDirection: "column" }}>{InputPanelEl}</div>
          <div style={{ position: "absolute", inset: 0, display: mobilePanel === "preview" ? "block" : "none" }}>
            {PreviewPanelEl}{CodePanelEl}
          </div>
          <div style={{ position: "absolute", inset: 0, display: mobilePanel === "editor"  ? "flex" : "none", flexDirection: "column" }}>{EditorPanelEl}</div>
        </div>

        {/* Bottom nav */}
        <MobileNav activePanel={mobilePanel} onSwitch={setMobilePanel} hasGame={hasGame} />

        {/* Modals */}
        <ApiKeyModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} onSave={handleSaveKey} currentKey={apiKey} />
        {toast && <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"} fade-in`}>{toast.type === "success" ? "✅" : "❌"} {toast.message}</div>}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // TABLET LAYOUT
  // ════════════════════════════════════════════════════════════════
  if (isTablet) {
    return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-primary)" }}>
        {Navbar}

        {/* Main: preview + code centred */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", background: "var(--bg-secondary)" }}>
          {PreviewPanelEl}
          {CodePanelEl}
        </div>

        {/* Input drawer (left) */}
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} width={300} from="left">
          {InputPanelEl}
        </Drawer>

        {/* Editor drawer (right) */}
        <Drawer open={editorDrawerOpen} onClose={() => setEditorDrawerOpen(false)} width={310} from="right">
          {EditorPanelEl}
        </Drawer>

        <ApiKeyModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} onSave={handleSaveKey} currentKey={apiKey} />
        {toast && <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"} fade-in`}>{toast.type === "success" ? "✅" : "❌"} {toast.message}</div>}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (4 panels, resizable)
  // ════════════════════════════════════════════════════════════════
  const effLeftW = sidebarCollapsed ? 0 : leftW;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-primary)" }}>
      {Navbar}

      <div ref={containerRef} style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden", background: "var(--border)", gap: 0 }}>

        {/* Panel 1: Input (collapsible) */}
        <div style={{
          width: effLeftW, flexShrink: 0,
          background: "var(--bg-secondary)", overflow: "hidden",
          display: "flex", flexDirection: "column", minWidth: 0,
          transition: "width .25s cubic-bezier(.4,0,.2,1)",
        }}>
          {!sidebarCollapsed && InputPanelEl}
        </div>

        <Divider handle="L" />

        {/* Panel 2+3: Code / Preview (tabbed, split) */}
        <div id="tour-preview" style={{ flex: midSplit, minWidth: 0, background: "var(--bg-secondary)", overflow: "hidden", position: "relative" }}>
          {CodePanelEl}
          {PreviewPanelEl}
        </div>

        <Divider handle="M" />

        <div style={{ flex: 1 - midSplit, minWidth: 0, background: "var(--bg-secondary)", overflow: "hidden", position: "relative" }}>
          {activeTab === "preview"
            ? <div style={{ position: "absolute", inset: 0 }}><CodePanel code={code} onChange={setCode} isStreaming={isGenerating} /></div>
            : <div style={{ position: "absolute", inset: 0 }}><PreviewPanel code={code} /></div>
          }
        </div>

        <Divider handle="R" />

        {/* Panel 4: Question Editor */}
        <div id="tour-editor" style={{ width: rightW, flexShrink: 0, background: "var(--bg-secondary)", overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {EditorPanelEl}
        </div>
      </div>

      <ApiKeyModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} onSave={handleSaveKey} currentKey={apiKey} />
      {toast && <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"} fade-in`}>{toast.type === "success" ? "✅" : "❌"} {toast.message}</div>}
    </div>
  );
}
