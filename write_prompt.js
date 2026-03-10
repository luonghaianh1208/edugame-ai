const fs = require('fs');
const path = require('path');

const content = `export interface GameGeneratorParams {
  topic: string;
  gameType: string;
  questionCount: number;
  difficulty: string;
  useTimer: boolean;
  useScoring: boolean;
  rewardPenalty: "none" | "points" | "time" | "both";
  description?: string;
}

const MECHANIC_GUIDES: Record<string, string> = {
  quiz: \`TIMER: Per-question countdown (20-30s based on difficulty). Beautiful progress bar.
SCORING: Correct=100pts + speed bonus (0-50pts). Wrong=-20pts (never below 0).
COMBO: 3+ correct in a row -> "COMBO x3 fire" and next points doubled.
UI: Large A/B/C/D buttons with colors, flip animation on select, shake on wrong.\`,

  matching: \`TIMER: Whole-game countdown (2-3 min). Score: 1st-try pair=100pts, 2nd-try=50pts, wrong=-10pts.
TIME: Correct pair +5s, wrong -8s.
COMBO: 3 pairs correct in a row = mini confetti burst.
UI: Two columns. Select left item (highlight) then click right item to connect. Green line=correct, shake+fade=wrong.\`,

  memory: \`TIMER: Whole-game countdown (3-5 min). Score: Find pair 1st flip=200pts, 2nd=100pts, 3rd+=50pts.
TIME: Correct pair +10s, 3+ wrong flips on same pair -5s.
COMBO: 2 pairs correct in a row -> "Memory Master!" bonus.
UI: Card grid with 3D flip animation (CSS rotateY 180deg). Stylish gradient back. Clear front content.\`,

  crossword: \`TIMER: Whole-game countdown (5-8 min). Score: Complete word=100pts, used hint=50pts max.
PENALTIES: Use hint button -20pts. View answer -30s.
REWARDS: Correct word +15s added to timer.
UI: Numbered letter grid, sidebar clues panel. Completed cells turn green, wrong turn red.\`,

  reaction: \`TIMER: Whole-game countdown (2-3 min). Score: Perfect sequence 1st try=200pts, retry=100pts.
REWARDS: Each correct step +20pts, wrong order -30pts. Complete sequence +20s.
COMBO: Perfect 1st try -> "PERFECT!" star animation + 50 bonus pts.
UI: Numbered cards that can be clicked in order 1->2->3. Slide animation when placing.\`,

  wordsearch: \`TIMER: Whole-game countdown (4-6 min based on word count). Score: Find word=50pts, quick find in 30s=80pts.
TIME: Find word +10s, press Hint button -20s.
UI: 10x10 letter grid. Click-and-drag to select word. Found words get colored highlight. Word list on side shows checkmarks.\`,

  fillblank: \`TIMER: Per-question countdown (15-25s). Score: Correct=100pts+speed bonus. Used hint=50pts max.
PENALTIES: Wrong 1st time -20pts, wrong 2nd time show answer and -30pts more.
TIME: Correct +5s added. Wrong: timer bar speeds up (pressure effect).
COMBO: Correct streak -> fire streak animation.
UI: Sentence with highlighted blank. Easy=word bank buttons. Hard=free typing input.\`,

  truefalse: \`TIMER: Per-question FAST countdown (8-12s). Creates excitement and pressure!
SCORING: Correct in first 5s=150pts (lightning round!), 5-10s=100pts, time almost out=50pts.
COMBO: x1.5 multiplier after 3 correct, x2.0 after 5 correct in a row.
PENALTIES: Wrong -30pts, Wrong -5s to timer.
UI: Large TRUE/FALSE buttons in green/red, strong click animation. Fast horizontal countdown bar.\`,
};

export function getGameGeneratorPrompt(params: GameGeneratorParams): string {
  const {
    topic, gameType, questionCount, difficulty,
    useTimer, useScoring, rewardPenalty, description
  } = params;

  const diffMap: Record<string, string> = {
    easy: "basic and direct - suitable for students new to this topic",
    medium: "mix of theory and application, requires understanding core concepts",
    hard: "deep analysis and multi-step reasoning, complex context questions",
  };
  const diffGuide = diffMap[difficulty] || "medium level";
  const mechanic = MECHANIC_GUIDES[gameType] || MECHANIC_GUIDES.quiz;

  const lines: string[] = [
    "You are EDUGAME AI, expert at creating beautiful, bug-free interactive educational HTML games for Vietnamese students.",
    "Your task: Build a single HTML file game that is visually stunning, educationally accurate, and runs perfectly without any JS errors.",
    "",
    "=== GAME REQUIREMENTS ===",
    \`Topic: \${topic}\`,
    \`Game Type: \${gameType}\`,
    \`Number of questions/items: \${questionCount}\`,
    \`Difficulty: \${diffGuide}\`,
    description ? \`Additional notes: \${description}\` : "",
    "",
    "=== GAME MECHANICS ===",
    mechanic,
    useTimer
      ? "YES TIMER: Implement countdown timer as described in the mechanic above."
      : "NO TIMER: No countdown. Optionally show elapsed time counting up.",
    useScoring
      ? "YES SCORING: Show realtime score in header. Animate score changes with floating text."
      : "NO SCORING: Show correct/wrong feedback only. No score panel needed.",
    rewardPenalty === "none" ? "NO REWARD/PENALTY: Casual mode." :
    rewardPenalty === "points" ? "SCORE REWARDS: Full combo streak system as described." :
    rewardPenalty === "time" ? "TIME REWARDS: Correct=add seconds, Wrong=subtract seconds." :
    "BOTH REWARDS: Combine score AND time rewards intelligently.",
    "",
    "=== UI DESIGN - MUST BE VISUALLY STUNNING ===",
    "Background: Rich dark gradient REQUIRED (e.g. #1a1a2e->#16213e->#0f3460 or #0f0c29->#302b63). NEVER plain white or grey.",
    "Font: 'Segoe UI', Arial Rounded, sans-serif. Base size 16px minimum.",
    "Buttons: border-radius >= 12px, gradient fill, box-shadow, hover:transform:scale(1.05) with transition.",
    "Use emojis directly for visual icons - no external icon libraries.",
    "Screen flow: INTRO (logo+title+animated Start button) -> GAME (header:score/timer/progress/combo) -> RESULT (stars+stats+Play Again).",
    "",
    "=== REQUIRED ANIMATIONS (CSS @keyframes only, no libraries) ===",
    "- Screen/question load: fade-in + slide-up (0.3s ease)",
    "- Correct answer: confetti burst or bounce or green glow + floating '+100' text that rises and fades",
    "- Wrong answer: shake (0.3s) + red background flash + brief explanation text",
    useTimer ? "- Timer critical (<=5s): timer bar turns red and pulses" : "",
    "- Combo achieved: fire or sparkle particle effect",
    "- Game complete: star reveal animation + confetti explosion",
    "",
    "=== AUDIO - Web Audio API ONLY (NO CDN, NO AUDIO FILES) ===",
    "Use this helper function - ALWAYS inside try/catch:",
    "function playSound(freq, dur, waveType) {",
    "  try {",
    "    const ctx = new (window.AudioContext || window.webkitAudioContext)();",
    "    const osc = ctx.createOscillator();",
    "    const gain = ctx.createGain();",
    "    osc.connect(gain); gain.connect(ctx.destination);",
    "    osc.type = waveType || 'sine';",
    "    osc.frequency.value = freq;",
    "    gain.gain.setValueAtTime(0.3, ctx.currentTime);",
    "    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);",
    "    osc.start(); osc.stop(ctx.currentTime + dur);",
    "  } catch(e) {}",
    "}",
    "- Correct: playSound(880, 0.2, 'sine')",
    "- Wrong: playSound(220, 0.4, 'sawtooth')",
    "- Win/Complete: 3-note ascending melody with timed playSound calls",
    useTimer ? "- Timer tick: playSound(440, 0.1, 'sine') once each second when <= 5s remain" : "",
    "",
    "=== EDUCATIONAL CONTENT REQUIREMENTS ===",
    \`Create exactly \${questionCount} questions/items about "\${topic}" at \${difficulty} difficulty.\`,
    "ACCURACY: Must be 100% factually correct - this is a real educational tool used in schools.",
    "DIVERSITY: Each question covers a different aspect. No repetitive question patterns.",
    "LANGUAGE: Vietnamese primarily. Scientific terms may stay in English or Latin.",
    "EXPLANATION: When wrong, show a brief 1-sentence explanation to help the student learn.",
    "",
    "=== JAVASCRIPT ROBUSTNESS - CRITICAL RULES ===",
    "The game MUST run without ANY errors. Every rule below is mandatory:",
    "",
    "RULE 1 - STATE MACHINE:",
    "  Use: let gameState = 'intro'; // values: 'intro' | 'playing' | 'result'",
    "  Use separate render functions: showIntro(), startGame(), showResult()",
    "  NEVER mix multiple screen rendering in one function.",
    "",
    "RULE 2 - SAFE EVENT LISTENERS:",
    "  - Declare ALL JavaScript functions BEFORE any HTML that calls them via onclick",
    "  - Preferred: use document.addEventListener('DOMContentLoaded', function() { init(); })",
    "  - Always check: const el = document.getElementById('id'); if (el) { el.addEventListener(...) }",
    "",
    "RULE 3 - TIMER MANAGEMENT:",
    "  let timerId = null;",
    "  // Before starting any new timer:",
    "  if (timerId) { clearInterval(timerId); timerId = null; }",
    "  timerId = setInterval(gameTick, 1000);",
    "  // On EVERY screen change: clearInterval(timerId); timerId = null;",
    "",
    "RULE 4 - WORKING PLAY AGAIN BUTTON (MANDATORY - MUST WORK PERFECTLY):",
    "  function restartGame() {",
    "    if (timerId) { clearInterval(timerId); timerId = null; }",
    "    score = 0; currentIndex = 0; combo = 0; streak = 0;",
    "    // Reset ALL game state variables",
    "    startGame(); // fresh start",
    "  }",
    "",
    "RULE 5 - PREVENT DOUBLE-CLICK BUGS:",
    "  Immediately after player answers, disable all answer buttons:",
    "  document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);",
    "  Re-enable when next question renders.",
    "",
    "RULE 6 - NO UNDEFINED VARIABLE ERRORS:",
    "  - Declare ALL variables with let/const BEFORE use",
    "  - Always check: if (currentIndex < questions.length) before questions[currentIndex]",
    "  - All functions must be DEFINED before they are CALLED",
    "  - Never use variable before declaring it",
    "",
    "=== TECHNICAL CONSTRAINTS ===",
    "- Single self-contained HTML file only: <!DOCTYPE html>...</html>",
    "- All CSS inside <style> tags - NO external stylesheets, NO CDN font/icon links",
    "- All JS inside <script> tags - NO external scripts, NO CDN links, NO fetch() to APIs",
    "- Must work completely offline",
    "- Responsive: works on desktop (1024px+) and mobile (375px+)",
    "- All question data hardcoded as JS const array at top of <script>",
    "",
    "=== OUTPUT FORMAT ===",
    "Return ONLY the HTML file content.",
    "Start with: <!DOCTYPE html>",
    "End with: </html>",
    "No markdown fences. No backticks. No explanations. Pure HTML only.",
  ];

  return lines.filter(l => l !== null && l !== undefined).join("\\n");
}
`;

fs.writeFileSync(
  path.join(__dirname, 'lib', 'prompts', 'gameGeneratorPrompt.ts'),
  content,
  'utf8'
);
console.log('Done!');
