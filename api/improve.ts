import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenAI({ apiKey });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { html, options } = req.body;

  const systemInstruction = `
    You are a world-class UI/UX designer.
    Improve the design of the following HTML document.
    Focus on: ${options?.focus || 'typography, spacing, and modern aesthetics'}.
    Keep the content the same, but make it look significantly better.
    
    Return ONLY the HTML. No markdown fences.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: html }] }],
      config: { systemInstruction }
    });

    const improvedHtml = response.text.replace(/```html/g, '').replace(/```/g, '').trim();
    res.status(200).json({ success: true, data: { html: improvedHtml } });
  } catch (error: any) {
    console.error("AI improvement error:", error);
    res.status(200).json({ success: false, error: error.message || "AI improvement failed" });
  }
}
