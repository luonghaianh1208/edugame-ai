export interface GameGeneratorParams {
  topic: string;
  gameType: string;
  questionCount: number;
  difficulty: string;
  useTimer: boolean;
  useScoring: boolean;
  rewardPenalty: "none" | "points" | "time" | "both";
  description?: string;
}

export function getGameGeneratorPrompt(params: GameGeneratorParams): string {
  const { topic, gameType, questionCount, difficulty, useTimer, useScoring, rewardPenalty, description } = params;

  const diffMap: Record<string, string> = {
    easy: "basic level - direct, non-tricky, for beginners of this topic",
    medium: "intermediate - mix theory with application, requires understanding",
    hard: "advanced - deep analysis, multi-step reasoning, complex scenarios",
  };
  const diffGuide = diffMap[difficulty] || "medium level";

  // ============================================================
  // DETAILED GAME MECHANICS - per game type
  // ============================================================
  const GAME_DESIGNS: Record<string, string> = {

    quiz: `=== QUIZ GAME DESIGN ===
LAYOUT:
- Header bar: Question X/N counter, Score display, Timer bar (if enabled), Combo indicator
- Question area: Large text showing the question (center screen, minimum 18px)
- Answer area: 4 buttons arranged in 2x2 grid, labeled A B C D
- Each button: distinct color (A=blue, B=purple, C=orange, D=red variant), large click area

FLOW EACH QUESTION:
1. Show question text with fade-in animation
2. Show 4 shuffled answer buttons (shuffle answer order each time, keep correct track)
3. Player clicks an answer
4. IMMEDIATELY: disable all 4 buttons to prevent double-click
5. Highlight correct button GREEN, wrong choice RED (if player was wrong)
6. Show brief explanation text under question (1 sentence) for 1.5 seconds
7. Auto-advance to next question after 1.5s delay
8. Repeat until all ${questionCount} questions complete
9. Show result screen

DATA STRUCTURE:
const questions = [
  { q: "Question text", answers: ["Correct", "Wrong1", "Wrong2", "Wrong3"], correct: 0, explain: "Because..." },
  ...
];
// Shuffle answers array before display but track correct index!`,

    matching: `=== MATCHING GAME DESIGN ===
CRITICAL: ALL ${questionCount} PAIRS must be visible simultaneously on screen at once.
NOT one-at-a-time - the entire set appears shuffled, player matches all of them.

LAYOUT:
- Header: Score, Timer (if enabled), Matches remaining counter
- Main area: TWO COLUMNS side by side
  - LEFT column: All ${questionCount} terms (concepts, words) in SHUFFLED order
  - RIGHT column: All ${questionCount} definitions/answers in DIFFERENTLY SHUFFLED order
  - Both columns visible at same time

INTERACTION:
1. Player clicks an item in the left column -> it highlights (blue border glow)
2. Player then clicks an item in the right column
3. If correct pair: draw a colored line connecting them, fade both to "matched" state (grey, semi-transparent), play correct sound
4. If wrong: both items shake/flash red, deselect, player must try again (no penalty to hide, just stays visible)
5. Continue until all pairs matched -> game ends

VISUAL LINE CONNECTION:
- Use SVG overlay or CSS to draw colored lines between matched pairs
- Or: matched pairs collapse/disappear with animation, remaining items reposition

LEFT items: terms/words/concepts (shuffled randomly)
RIGHT items: definitions/translations/answers (shuffled INDEPENDENTLY - different order from left)

DATA STRUCTURE:
const pairs = [
  { left: "Term/Word/Concept", right: "Definition/Answer/Match" },
  ... // exactly ${questionCount} pairs
];
// Shuffle left array and right array INDEPENDENTLY before display`,

    memory: `=== MEMORY CARD GAME DESIGN ===
LAYOUT:
- Header: Pairs found X/N, Moves counter, Score, Timer (if enabled)
- Grid of ${questionCount * 2} cards arranged in rows (e.g. 4x5 for 10 pairs, 4x4 for 8 pairs)
- ALL cards face-down initially (show back face with gradient/pattern)

CARD CONTENT (each pair):
- Card A: shows the TERM/QUESTION
- Card B: shows the DEFINITION/ANSWER
- Player must flip A then B to match them
- Cards contain text only (no images needed)

INTERACTION FLOW:
1. Player clicks card -> it flips over with 3D animation (CSS rotateY 0->180deg, 0.4s)
2. First card stays face-up while player picks second card
3. Player clicks second card -> it flips
4. Compare the two face-up cards:
   - MATCH: both cards stay face-up, glow green, play correct sound, increment score
   - NO MATCH: both cards flip back face-down after 1 second delay, play wrong sound
5. Only 2 cards can be face-up at a time (lock clicks during comparison)
6. Game ends when all pairs found

3D FLIP ANIMATION (CSS):
.card { transform-style: preserve-3d; transition: transform 0.4s; }
.card.flipped { transform: rotateY(180deg); }
.card-front { backface-visibility: hidden; }
.card-back { backface-visibility: hidden; transform: rotateY(180deg); }

DATA: ${questionCount} pairs, each with a "term" side and "answer" side.
Total cards on grid: ${questionCount * 2} cards`,

    crossword: `=== CROSSWORD PUZZLE DESIGN ===
LAYOUT:
- Left side (60%): Interactive crossword grid
- Right side (40%): Clues list scrollable (ACROSS and DOWN sections)
- Header: Score, Timer (if enabled), words remaining

GRID CONSTRUCTION:
- Build a real intersecting crossword grid where words share letters at intersections
- Each cell: numbered if it starts a word, white background, input capable
- Cells not part of any word: black/dark background
- Player clicks a cell -> highlights entire word direction, clue highlighted in list

INTERACTION:
1. Player clicks any white cell to activate it
2. The full word (ACROSS or DOWN based on direction) highlights in blue
3. The corresponding clue highlights in the right panel
4. Player types letters into cells (one letter per cell, auto-advance to next cell)
5. Letter auto-capitalizes
6. When word completed correctly: entire word turns green, play sound
7. When word completed wrong: flash red, clear cells, allow retry
8. Press Tab to switch between ACROSS and DOWN for same starting cell

HINT SYSTEM: "Goi y" button reveals first letter of selected word (penalty to score)

WORDS: Generate ${questionCount} words that CAN intersect to form a valid crossword.
Words should be related to the topic "${topic}". Include ACROSS and DOWN clues.`,

    reaction: `=== ORDERING/SEQUENCE GAME DESIGN ===
IMPORTANT: This is a SEQUENCE ORDERING game - player puts items in correct logical order.

LAYOUT:
- Header: Score, Timer (if enabled), Round X/N
- Scrambled items area: ${Math.min(questionCount, 6)} cards/items displayed in RANDOM ORDER
- Each card shows content that must be ordered (steps, events, numbers, processes)
- "Submit Order" button at bottom

INTERACTION (CLICK-TO-ORDER):
1. Display ${Math.min(questionCount, 6)} shuffled items per round (positions 1-N shown scrambled)
2. Player clicks items in the CORRECT sequence ORDER (click-to-select approach):
   - Click item 1 (first in correct order) -> shows "1" badge on it
   - Click item 2 -> shows "2" badge on it
   - Continue until all items ordered
3. "Kiểm tra" button (or auto-check when last item clicked)
4. Show result: correct items in green (right position), wrong items in red
5. Play correct/wrong sounds, show points
6. Next round with new set of items

ALTERNATIVELY (DRAG-AND-DROP if cleaner): Items have drag handles, player drags into order slots.

DATA STRUCTURE:
const sequences = [
  {
    title: "Arrange in correct order: [topic-specific instruction]",
    items: ["Step 1 text", "Step 2 text", "Step 3 text", "Step 4 text"],
    // items stored in CORRECT ORDER, shuffle before display
  },
  ... // ${questionCount} different sequences
];`,

    wordsearch: `=== WORD SEARCH GAME DESIGN ===
LAYOUT:
- Main area (65%): Letter grid (12x12 or 15x15 depending on word count)
- Right panel (35%): List of words to find, each with a checkbox or strikethrough when found
- Header: Words found X/${questionCount}, Timer (if enabled), Score

GRID CONSTRUCTION:
1. Create a ${questionCount <= 8 ? '12x12' : '15x15'} grid filled with random letters
2. Place all ${questionCount} words in the grid: HORIZONTALLY, VERTICALLY, or DIAGONALLY (both directions)
3. Fill remaining empty cells with random letters (A-Z)
4. Words can overlap at shared letters
5. Uppercase letters only

INTERACTION (CLICK AND DRAG):
1. Player CLICKS first letter of a word (mousedown/touchstart)
2. Player DRAGS to last letter (mousemove/touchmove) - highlight path in blue as they drag
3. Player RELEASES (mouseup/touchend) - validate selection
4. If valid word: highlight path in unique color (different color per found word), mark word in list with checkmark
5. If invalid: path fades/disappears, try again
6. Game ends when all words found (or timer runs out)

WORD PLACEMENT ALGORITHM:
function placeWord(grid, word, direction) {
  // Try random positions, check if word fits without conflicting letters
  // directions: horizontal right, vertical down, diagonal down-right, horizontal left, etc.
}

DATA: ${questionCount} words related to topic "${topic}" (4-10 letters each, uppercase)
Show words in the word list sorted ALPHABETICALLY for easy reference`,

    fillblank: `=== FILL IN THE BLANK GAME DESIGN ===
LAYOUT:
- Header: Question X/${questionCount}, Score, Timer (if enabled)
- Sentence display: Full sentence with blank shown as "______" or [?]
- Answer input area: EITHER word banks (clickable buttons) OR text input field
- Submit button (or auto-submit on word bank click)

DIFFICULTY-BASED MODE:
- Easy/Medium: WORD BANK mode
  - Show the correct answer + 2-3 distractor words as clickable buttons
  - Player clicks the correct word to fill the blank
  - Buttons shuffle randomly each question
- Hard: FREE TYPE mode
  - Player types the answer in a text input field
  - Case-insensitive matching, trim whitespace
  - Accept slight misspellings? (optional: Levenshtein distance 1-2)

INTERACTION:
1. Show sentence with blank: "The mitochondria is known as the ______ of the cell"
2. Player selects/types answer
3. Immediate feedback: blank fills in GREEN (correct) or RED (wrong)
4. Show correct answer if wrong, with explanation
5. Auto-advance to next question after 1.5s

BLANK PLACEMENT: Blank can be:
- A KEY TERM in the middle or end of sentence
- A SPECIFIC VALUE/NUMBER
- A PERSON NAME / PLACE NAME
- A SCIENTIFIC TERM

DATA STRUCTURE:
const questions = [
  {
    sentence: "The ______ is the powerhouse of the cell",
    blank: "mitochondria",
    distractors: ["nucleus", "ribosome", "chloroplast"],
    explain: "Mitochondria produces ATP energy through cellular respiration"
  },
  ... // ${questionCount} sentences
];`,

    truefalse: `=== TRUE OR FALSE GAME DESIGN ===
LAYOUT:
- Full-screen statement display (large readable text, center of screen)
- Header: Question X/${questionCount}, Score, Timer progress bar (if enabled)
- Two buttons at bottom: big "DUNG" (TRUE) button in GREEN, big "SAI" (FALSE) button in RED
- Combo multiplier display (if scoring enabled)

INTERACTION FLOW:
1. Statement appears with slide-in animation
2. Timer counts down FAST (8-15 seconds shows urgency - timer bar depletes visually)
3. Player clicks TRUE or FALSE
4. IMMEDIATELY: disable both buttons, show correct answer
   - If player was RIGHT: button glows, +points with floating text animation
   - If player was WRONG: correct button highlighted, player choice X'd out
5. Show brief explanation (1 sentence) for 1.5 seconds
6. Next statement slides in
7. If timer expires = counted as wrong answer

LIGHTNING ROUND SCORING (if useScoring):
- Answer in first 1/3 of time: maximum points (150pts)
- Answer in middle 1/3: medium points (100pts)
- Answer in last 1/3: fewer points (50pts)
- Time expired: 0 points, wrong answer

STATEMENT DESIGN:
- Mix of TRUE statements (about 50%) and FALSE statements (different 50%)
- FALSE statements should be PLAUSIBLE misconceptions (not obviously wrong)
- Vary the topics covered within "${topic}"

DATA STRUCTURE:
const statements = [
  { text: "Statement about the topic", isTrue: true/false, explain: "Because..." },
  ... // ${questionCount} statements, shuffle to mix true/false
];`,
  };

  const gameDesign = GAME_DESIGNS[gameType] || GAME_DESIGNS.quiz;

  const timerLine = useTimer
    ? "YES TIMER: Implement timer as specified in game design. Show visual countdown."
    : "NO TIMER: No countdown pressure. Can show elapsed time counting up.";
  const scoringLine = useScoring
    ? "YES SCORING: Full scoring system as per game design. Animate score changes with floating '+points' text."
    : "NO SCORING: Show only correct/wrong feedback. No score display needed.";
  const rewardLine =
    rewardPenalty === "none" ? "NO REWARD/PENALTY: Casual relaxed mode." :
    rewardPenalty === "points" ? "SCORE REWARDS: Correct answers add points, wrong deduct points. Implement combo multiplier streak." :
    rewardPenalty === "time" ? "TIME REWARDS/PENALTIES: Correct=add seconds to timer, Wrong=subtract seconds from timer." :
    "BOTH REWARDS: Combine both score changes AND time changes on correct/wrong answers.";

  const lines = [
    "You are EDUGAME AI, an expert at building beautiful, interactive, bug-free educational HTML games for Vietnamese students.",
    "Create a single self-contained HTML file game that is visually stunning, educationally accurate, and runs perfectly.",
    "",
    "============================================================",
    "GAME REQUIREMENTS",
    "============================================================",
    "Topic: " + topic,
    "Game Type: " + gameType,
    "Number of questions/items: " + questionCount,
    "Difficulty: " + diffGuide,
    description ? "Additional instructions: " + description : "",
    "",
    "============================================================",
    gameDesign,
    "============================================================",
    "",
    "SETTINGS:",
    timerLine,
    scoringLine,
    rewardLine,
    "",
    "============================================================",
    "VISUAL DESIGN REQUIREMENTS - MUST BE STUNNING",
    "============================================================",
    "Background: Rich dark gradient (e.g. #1a1a2e->#16213e->#0f3460 or #0f0c29->#302b63 etc). NEVER plain white/grey.",
    "Font: 'Segoe UI', Arial Rounded, system-ui, sans-serif. Base size 16px+.",
    "Buttons: border-radius >= 12px, gradient backgrounds, box-shadow, hover:scale(1.05) transition 0.15s.",
    "Use emoji directly in HTML (no icon libs needed).",
    "",
    "3 SCREENS REQUIRED:",
    "1. INTRO SCREEN: Game title with emoji, topic name, game type badge, animated Start button, brief instruction",
    "2. GAME SCREEN: Active gameplay with header (score/timer/progress indicator)",
    "3. RESULT SCREEN: Total score, star rating (1-3 based on score %), key stats, Play Again button",
    "",
    "REQUIRED ANIMATIONS (CSS @keyframes only, no libraries):",
    "- Screen transitions: fade-in + slide-up (0.3s ease)",
    "- Correct answer: green glow + scale up + floating '+N pts' text that rises then fades",
    "- Wrong answer: shake animation (0.3s) + red flash",
    useTimer ? "- Timer critical (<=20% time remaining): timer bar pulses red" : "",
    "- Combo achieved: star burst or sparkle effect",
    "- Result screen: animated star reveal (pop in sequence)",
    "",
    "============================================================",
    "SOUND - Web Audio API ONLY (no CDN, no audio files)",
    "============================================================",
    "// Always inside try/catch:",
    "function playSound(freq, dur, waveType, vol) {",
    "  try {",
    "    const ctx = new (window.AudioContext || window.webkitAudioContext)();",
    "    const osc = ctx.createOscillator();",
    "    const gain = ctx.createGain();",
    "    osc.connect(gain); gain.connect(ctx.destination);",
    "    osc.type = waveType || 'sine';",
    "    osc.frequency.value = freq;",
    "    gain.gain.setValueAtTime(vol||0.25, ctx.currentTime);",
    "    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);",
    "    osc.start(); osc.stop(ctx.currentTime + dur);",
    "  } catch(e) {}",
    "}",
    "- Start game: playSound(523, 0.15, 'sine') then playSound(659, 0.15, 'sine') delayed 150ms",
    "- Correct: playSound(880, 0.2, 'sine')",
    "- Wrong: playSound(196, 0.5, 'sawtooth')",
    "- Game complete (win): ascending melody 3 notes",
    useTimer ? "- Timer critical: playSound(440, 0.08, 'square') each tick when <= 5 seconds remain" : "",
    "",
    "============================================================",
    "MANDATORY: GENERATE COMPLETE REAL DATA - NO PLACEHOLDERS",
    "============================================================",
    "You MUST generate ALL " + questionCount + " items of real educational content inline inside the <script> tag.",
    "FORBIDDEN: const questions = []; // fill later",
    "FORBIDDEN: const questions = [/* ... items ... */];",
    "FORBIDDEN: leaving any array empty or with placeholder comments",
    "REQUIRED: const questions = [ {full object 1}, {full object 2}, ... all " + questionCount + " items ];",
    "",
    "Rules for data:",
    "- Generate every single item, do not stop early",
    "- Each item unique, factually correct, related to topic: '" + topic + "'",
    "- Do not use ellipsis '...' as shorthand for more items",
    "- If topic has fewer facts than " + questionCount + ", vary angles (definitions, examples, applications)",
    "",
    "============================================================",
    "EDUCATIONAL CONTENT",
    "============================================================",
    "Create exactly " + questionCount + " items/questions about topic: '" + topic + "' at " + difficulty + " difficulty.",
    "ACCURACY: Must be 100% factually correct - used in real classrooms.",
    "DIVERSITY: Cover different aspects of the topic. No two questions of the same type/angle.",
    "LANGUAGE: Vietnamese. Keep scientific/technical terms in original language (English/Latin) when needed.",
    "WRONG ANSWER FEEDBACK: Show a brief explanation sentence when student answers incorrectly.",
    "",
    "============================================================",
    "JAVASCRIPT ROBUSTNESS - MANDATORY RULES",
    "============================================================",
    "RULE 1 - STATE MACHINE:",
    "  let gameState = 'intro'; // 'intro' | 'playing' | 'result'",
    "  Separate render functions: showIntro(), startGame(), showResult()",
    "",
    "RULE 2 - GLOBAL FUNCTION SCOPE (CRITICAL - most common bug source):",
    "  FORBIDDEN - functions inside DOMContentLoaded wrapper:",
    "    document.addEventListener('DOMContentLoaded', () => {",
    "      function startGame() { ... }   // ← WRONG: not in global scope",
    "    });",
    "",
    "  FORBIDDEN - IIFE pattern:",
    "    (function() { function startGame() { ... } })();",
    "",
    "  FORBIDDEN - const/let arrow function declarations:",
    "    const startGame = () => { ... };  // const/let is block-scoped, may cause issues",
    "",
    "  REQUIRED - ALL game functions as plain global function declarations:",
    "    function showIntro() { ... }",
    "    function startGame() { ... }",
    "    function showResult() { ... }",
    "    function tick() { ... }",
    "    // ... all other functions ...",
    "    showIntro(); // ← LAST line of script: this is the ONLY top-level call",
    "",
    "  WHY: HTML onclick='startGame()' can only call functions in global window scope.",
    "  Functions inside callbacks/IIFEs are NOT in window scope = 'is not defined' error.",
    "",
    "RULE 3 - TIMER SAFETY:",
    "  let timerId = null;",
    "  Before starting: if (timerId) { clearInterval(timerId); timerId = null; }",
    "  timerId = setInterval(tick, 1000);",
    "  On every screen change: clearInterval(timerId); timerId = null;",
    "",
    "RULE 4 - WORKING PLAY AGAIN:",
    "  function restartGame() {",
    "    if (timerId) { clearInterval(timerId); timerId = null; }",
    "    score = 0; currentIndex = 0; combo = 0;",
    "    // reset ALL state vars, re-shuffle data",
    "    startGame();",
    "  }",
    "",
    "RULE 5 - PREVENT DOUBLE CLICKS:",
    "  After answer selected: immediately disable all answer elements.",
    "  Re-enable when next question loads.",
    "",
    "RULE 6 - NO ERRORS:",
    "  Declare all variables before use. Check bounds before array access.",
    "  All functions defined before called. No undefined variable references.",
    "",
    "============================================================",
    "TECHNICAL CONSTRAINTS",
    "============================================================",
    "- Single HTML file ONLY: <!DOCTYPE html>...</html>",
    "- All CSS in <style> tag in <head> - NO CDN, NO Google Fonts URL, NO external stylesheets",
    "- ALL <script> tags MUST be placed IMMEDIATELY BEFORE </body> - NEVER in <head>",
    "- Script structure MUST follow this EXACT pattern:",
    "  <script>",
    "  // 1. State variables",
    "  let gameState = 'intro', score = 0, currentIndex = 0;",
    "  // 2. ALL function declarations (global scope - no wrappers)",
    "  function showIntro() { ... }",
    "  function startGame() { ... }",
    "  function showResult() { ... }",
    "  // 3. SINGLE init call - last line",
    "  showIntro();",
    "  </script>",
    "- NEVER wrap functions in DOMContentLoaded, IIFE, or any callback.",
    "- NEVER use const/let for function declarations that are called from onclick.",
    "- All JS in <script> - NO CDN, NO external scripts, NO fetch() to APIs",
    "- Works completely offline",
    "- Responsive: desktop 1024px+ and mobile 375px+",
    "- All data hardcoded in JS const/array inside <script>",
    "",
    "============================================================",
    "OUTPUT FORMAT",
    "============================================================",
    "Return ONLY the HTML code.",
    "First line: <!DOCTYPE html>",
    "Last line: </html>",
    "No markdown, no backticks, no explanations. PURE HTML ONLY.",
  ];

  return lines.filter(Boolean).join("\n");
}
