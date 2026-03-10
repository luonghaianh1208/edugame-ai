

export function getDataGeneratorPrompt(
  templateId: string,
  topic: string,
  count: number,
  difficulty: string
): string {
  const diffMap: Record<string, string> = {
    easy: 'basic level, direct questions, for beginners',
    medium: 'intermediate, mix theory and application',
    hard: 'advanced, deep analysis, complex scenarios',
  };
  const diffGuide = diffMap[difficulty] || 'medium level';

  return `You are an educational question generator. Generate exactly ${count} quiz questions about: "${topic}" at ${diffGuide}.

## OUTPUT FORMAT - MANDATORY

Return ONLY a valid JSON array. Nothing else. No markdown. No explanation. No backticks.

Start your response with [ and end with ]

## JSON SCHEMA (strictly follow this):
[
  {
    "q": "Question text in Vietnamese",
    "answers": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correct": 0,
    "explain": "Brief explanation why the answer is correct (1-2 sentences Vietnamese)"
  }
]

## RULES:
1. Exactly ${count} objects in the array
2. "answers" always has EXACTLY 4 strings
3. "correct" is always the index (0, 1, 2, or 3) of the correct answer in "answers"  
4. Shuffle correct answer position — don't always put it at index 0
5. All text in Vietnamese (keep technical/scientific terms in their original language)
6. 100% factually accurate — used in real classrooms
7. Each question covers a different aspect of "${topic}"
8. Wrong answers should be plausible (not obviously wrong)
9. "explain" is 1-2 short Vietnamese sentences
10. No two questions should be identical or near-identical

Return ONLY the JSON array now:`;
}
