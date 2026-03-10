const fs = require('fs');
const file = 'lib/prompts/gameGeneratorPrompt.ts';
let c = fs.readFileSync(file, 'utf8');

// Add 'custom' case to GAME_DESIGNS object before the closing }; line
const customCase = `
  custom: \`=== CUSTOM GAME TYPE ===
The user has defined their own game type. Read the description in the [LOAI GAME TU DINH NGHIA] section and implement EXACTLY what they described.
Build the full game mechanics based solely on their description.
Apply the timer, scoring, and reward/penalty settings from the configuration.
If they don't specify scoring details, use: correct answer = 100pts, wrong = -20pts.
Follow all standard JS robustness rules. The game must be fully playable with no errors.
Be creative and make the UI beautiful as always.\`,
`;

// Insert before the closing of GAME_DESIGNS
c = c.replace(
  "  truefalse: `TIMER:",
  customCase + "  truefalse: `TIMER:"
);

// Also handle the gameDesign lookup to ensure custom falls through with the description
c = c.replace(
  'const gameDesign = MECHANIC_GUIDES[gameType] || MECHANIC_GUIDES.quiz;',
  'const gameDesign = MECHANIC_GUIDES[gameType] || MECHANIC_GUIDES.quiz;'
);

fs.writeFileSync(file, c, 'utf8');
console.log('Patched: added custom game type to GAME_DESIGNS');
