const fs = require('fs');
const file = 'lib/prompts/gameGeneratorPrompt.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(
  '.filter(l => l !== null && l !== undefined && l !== false).join("\\n")',
  '.filter(Boolean).join("\\n")'
);
fs.writeFileSync(file, c, 'utf8');
console.log('Patched filter line');
