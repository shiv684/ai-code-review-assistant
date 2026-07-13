const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1', // ye line add ki
});

async function runAIReview(sourceCode, language) {
  const prompt = `You are a senior code reviewer. Analyze the following ${language} code and return ONLY a valid JSON array (no markdown, no explanation, no code fences) of findings. Each finding must have this exact structure:

{
  "severity": "critical" | "warning" | "info",
  "issue": "short issue title",
  "explanation": "1-2 sentence explanation of the problem",
  "suggested_fix": "1-2 sentence suggested fix",
  "line_number": number or null
}

Focus on: bugs, security issues, performance problems, code smells, and best practice violations. Do not repeat basic syntax issues — focus on logic, security, and design problems.

Code to review:
\`\`\`${language}
${sourceCode}
\`\`\`

Return ONLY the JSON array, nothing else.`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // Groq ka free, powerful model
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const rawText = response.choices[0].message.content;
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse AI response:', rawText);
    return [];
  }
}

module.exports = { runAIReview };