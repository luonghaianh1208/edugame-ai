const fs = require('fs');
const file = 'lib/prompts/gameGeneratorPrompt.ts';
let c = fs.readFileSync(file, 'utf8');

// Critical data section to insert
const dataSection = [
  '    "============================================================",',
  '    "MANDATORY: GENERATE COMPLETE REAL DATA - NO PLACEHOLDERS",',
  '    "============================================================",',
  '    "You MUST generate ALL " + questionCount + " items of real educational content inline inside the <script> tag.",',
  '    "FORBIDDEN: const questions = []; // fill later",',
  '    "FORBIDDEN: const questions = [/* ... items ... */];",',
  '    "FORBIDDEN: leaving any array empty or with placeholder comments",',
  '    "REQUIRED: const questions = [ {full object 1}, {full object 2}, ... all " + questionCount + " items ];",',
  '    "",',
  '    "Rules for data:",',
  '    "- Generate every single item, do not stop early",',
  '    "- Each item unique, factually correct, related to topic: \'" + topic + "\'",',
  '    "- Do not use ellipsis \'...\' as shorthand for more items",',
  '    "- If topic has fewer facts than " + questionCount + ", vary angles (definitions, examples, applications)",',
  '    "",',
].join('\n');

const marker = '    "============================================================",\n    "EDUCATIONAL CONTENT",';
if (c.includes(marker)) {
  c = c.replace(marker, dataSection + '\n    "============================================================",\n    "EDUCATIONAL CONTENT",');
  fs.writeFileSync(file, c, 'utf8');
  console.log('Patched: mandatory real data section added before EDUCATIONAL CONTENT');
} else {
  // Try before OUTPUT FORMAT
  const marker2 = '    "============================================================",\n    "OUTPUT FORMAT",';
  if (c.includes(marker2)) {
    c = c.replace(marker2, dataSection + '\n    "============================================================",\n    "OUTPUT FORMAT",');
    fs.writeFileSync(file, c, 'utf8');
    console.log('Patched (fallback): added before OUTPUT FORMAT');
  } else {
    // Append near end of lines array
    c = c.replace(
      '    "Return ONLY the HTML code.",',
      dataSection + '\n    "Return ONLY the HTML code.",'
    );
    fs.writeFileSync(file, c, 'utf8');
    console.log('Patched (fallback2): added before Return ONLY');
  }
}
