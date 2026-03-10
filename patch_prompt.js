const fs = require('fs');
const file = 'lib/prompts/gameGeneratorPrompt.ts';
let c = fs.readFileSync(file, 'utf8');

// Add SCRIPT PLACEMENT rule to Technical Constraints section
const oldConstraints = `    "- Single HTML file ONLY: <!DOCTYPE html>...</html>",
    "- All CSS in <style> - NO CDN, NO Google Fonts URL, NO external stylesheets",
    "- All JS in <script> - NO CDN, NO external scripts, NO fetch() to APIs",
    "- Works completely offline",`;

const newConstraints = `    "- Single HTML file ONLY: <!DOCTYPE html>...</html>",
    "- All CSS in <style> tag in <head> - NO CDN, NO Google Fonts URL, NO external stylesheets",
    "- ALL <script> tags MUST be placed IMMEDIATELY BEFORE </body> - NEVER in <head>",
    "- CRITICAL: Never call getElementById/querySelector or addEventListener at top level.",
    "  All DOM interactions MUST be inside functions that are only called AFTER the DOM renders.",
    "  Pattern: <script> function showIntro(){...} function startGame(){...} showIntro(); </script>",
    "  The LAST line of the script calls the first screen function (showIntro or init).",
    "- All JS in <script> - NO CDN, NO external scripts, NO fetch() to APIs",
    "- Works completely offline",`;

c = c.replace(oldConstraints, newConstraints);

if (c.includes('IMMEDIATELY BEFORE </body>')) {
  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ Patched: script-at-body-end rule added');
} else {
  console.error('❌ Target string not found - pattern may have changed');
  process.exit(1);
}
