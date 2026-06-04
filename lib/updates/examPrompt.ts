export function buildExamPrompt(extractedText: string, questionCount: 10 | 20): string {
  const mc  = Math.round(questionCount * 0.5)
  const tf  = Math.round(questionCount * 0.25)
  const fb  = questionCount - mc - tf

  return `You are an exam author. Based ONLY on the document content below, generate exactly ${questionCount} exam questions.

QUESTION TYPE BREAKDOWN:
- ${mc} multiple-choice questions (4 options labeled "A. …", "B. …", "C. …", "D. …")
- ${tf} true/false questions
- ${fb} fill-in-the-blank questions (use "___ " to mark the blank)

RULES:
1. Every question must be answerable from the document content only — no outside knowledge.
2. Multiple-choice: exactly 4 options. correct_answer must be the FULL option text (e.g. "A. Paris").
3. True/False: options must be exactly ["True","False"]. correct_answer is "True" or "False".
4. Fill-in-the-blank: correct_answer is the primary expected word/phrase. Include 2–4 acceptable_variants as lowercase alternatives.
5. Assign id values "q1" through "q${questionCount}". Set points: 1 for every question.
6. Make questions varied — avoid repeating the same fact in multiple questions.

DOCUMENT CONTENT:
---
${extractedText.slice(0, 40_000)}
---

Respond with a JSON object ONLY (no markdown, no explanation, no code fences):
{"questions": [ /* array of ${questionCount} ExamQuestion objects */ ]}`
}
