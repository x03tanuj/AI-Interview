import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateQuestion = async (role, difficulty, mode, previousQAs) => {
  try {
    const prompt = `
You are an experienced senior technical interviewer.

Interview Details:
- Role: ${role}
- Difficulty: ${difficulty}
- Interview Mode: ${mode}

Candidate History:
${previousQAs}

Instructions:
1. Analyze all previous questions and answers.
2. Do NOT repeat any previously asked question.
3. Ask exactly ONE new interview question.
4. The question should be appropriate for the specified role and difficulty.
5. If the candidate performed poorly in a topic, ask a follow-up question to assess understanding.
6. If the candidate performed well, gradually increase difficulty.
7. Keep the interview realistic and similar to actual industry interviews.
8. For technical roles:
   - Focus on fundamentals before advanced concepts.
   - Prefer scenario-based and practical questions.
   - Avoid trivia unless difficulty is "hard".
9. Return only the interview question.
10. No explanations, greetings, numbering, markdown, or extra text.

Output:
<Question>
`;
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-20b",
    });
    return response.choices[0]?.message?.content;
  } catch (error) {
    console.error("generateQuestion error:", error);
    return null;
  }
};

export const evaluateAnswer = async (
  question,
  answer,
  role,
  difficulty,
  mode,
) => {
  try {
    const prompt = `
You are a strict senior technical interviewer evaluating a candidate's answer.

Interview Context:
- Role: ${role}
- Difficulty: ${difficulty}
- Interview Mode: ${mode}

Question:
${question}

Candidate Answer:
${answer}

Evaluation Rules:
1. Evaluate technical correctness first.
2. Check completeness of the answer.
3. Check clarity and communication.
4. Identify missing concepts.
5. Identify incorrect statements.
6. Compare the answer against industry-standard expectations.
7. Be strict but fair.
8. Give higher scores only when the answer is technically accurate and complete.

Scoring Guide:
- 1-2: Completely incorrect or irrelevant.
- 3-4: Major gaps and misunderstandings.
- 5-6: Partially correct but missing important concepts.
- 7-8: Mostly correct with minor gaps.
- 9: Strong answer with good depth.
- 10: Excellent answer, technically complete and interview-ready.

Return ONLY valid JSON.

{
  "score": <integer 1-10>,
  "feedback": "<specific weaknesses, mistakes, and missing concepts>",
  "strengths": "<what was answered correctly>",
  "idealAnswer": "<concise but complete model answer>",
  "followUpTopic": "<best topic to test next>"
}

Important:
- Return raw JSON only.
- No markdown.
- No code blocks.
- No additional text.
`;
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-20b",
    });
    try {
      return JSON.parse(response.choices[0]?.message?.content);
    } catch (error) {
      throw new Error("Groq returned invalid JSON");
    }
  } catch (error) {
    console.error("evaluateAnswer error:", error);
    throw new Error("Groq failed to evaluate answer: " + error.message);
  }
};
