const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function generateDocumentation(sourceCode, language) {
  const prompt = `You are a technical documentation generator. Analyze the following ${language} code and produce documentation for every function, class, and exported API in it.

Return the ORIGINAL code with proper documentation comments inserted above each function/class (JSDoc style for JavaScript, docstrings for Python, Javadoc for Java, etc., based on the language).

Rules:
- Do not change the logic of the code, only add documentation comments.
- Each function's documentation should include: a short description, parameter types and descriptions, and return type/description.
- Return ONLY the documented code, no extra explanation, no markdown code fences.

Code:
${sourceCode}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const rawText = response.choices[0].message.content;

  // Remove markdown code fences if the model added them anyway
  const cleaned = rawText.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();

  return cleaned;
}

module.exports = { generateDocumentation };