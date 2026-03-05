import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenAI({ apiKey });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { html, errors } = req.body;

  const systemInstruction = `
    You are an expert web developer.
    The user provided an HTML document that has errors or is broken.
    Fix the HTML and return the COMPLETE, corrected document.
    Errors reported: ${JSON.stringify(errors)}
    
    Return ONLY the HTML. No markdown fences.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: html }] }],
      config: { systemInstruction }
    });

    res.status(200).json({ html: response.text.replace(/```html/g, '').replace(/```/g, '').trim() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
