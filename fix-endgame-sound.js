const fs = require('fs');
const path = require('path');

const dir = 'lib/templates';
const files = ['bomb-defuse.ts','mosaic-reveal.ts','mountain-climb.ts','rpg-battle.ts','treasure-hunt.ts','tug-of-war.ts'];

// For templates that have endGame with show result but named differently:
// 1. They likely have patterns: 'id="intro"' show/hide or a lose/win screen
// Strategy: find first occurrence of showing a result/end screen after bgmStop wasn't injected
// Add snd.bgmStop(); snd.victory(); near the game-over display logic

// Universal patterns to find the game end/result display moment
const END_PATTERNS = [
  // Pattern: showing intro div as hidden + game div as flex
  /document\.getElementById\('intro'\)\.style\.display = 'none';\n\s*document\.getElementById\('game'\)\.style\.display/,
];

files.forEach(f => {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  // Look for the endGame function body (could be named differently or use inline logic)
  // Strategy: find the first line that contains 'res-title' or 'res-emoji' or result panel
  // and prepend snd.bgmStop(); snd.victory(); just before it

  // Pattern 1: document.getElementById('res-title') or document.getElementById('res-emoji')
  let changed = false;

  // find: document.getElementById('res-
  const resMatch = c.match(/(\s{2,})(document\.getElementById\('res-)/);
  if (resMatch) {
    // Find the enclosing function's first statement
    // Insert snd.bgmStop(); snd.victory(); before the first res- access
    const idx = c.indexOf(resMatch[0]);
    const before = c.substring(0, idx);
    const after = c.substring(idx);
    // Add after the newline/indent before the first res- statement
    const toInsert = resMatch[1] + 'snd.bgmStop(); snd.victory();\n';
    c = before + toInsert + resMatch[1] + resMatch[2] + after.substring(resMatch[0].length);
    changed = true;
    console.log(`  ✓ [${f}] endGame victory sound injected before res- display`);
  } else {
    // Pattern 2: look for win/lose result screen show
    const winMatch = c.match(/(\s{2,})(document\.getElementById\('win)/);
    if (winMatch) {
      const idx = c.indexOf(winMatch[0]);
      const before = c.substring(0, idx);
      const after = c.substring(idx);
      const toInsert = winMatch[1] + 'snd.bgmStop(); snd.victory();\n';
      c = before + toInsert + winMatch[1] + winMatch[2] + after.substring(winMatch[0].length);
      changed = true;
      console.log(`  ✓ [${f}] endGame victory via win-screen`);
    } else {
      console.log(`  - [${f}] Could not find result screen pattern`);
    }
  }

  if (changed) fs.writeFileSync(p, c, 'utf8');
});

console.log('\nDone!');
