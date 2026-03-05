import { generateWebsite } from '../generate';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, options } = req.body;

  try {
    const result = await generateWebsite(prompt, options);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("AI generation error:", error);
    res.status(200).json({ success: false, error: error.message || "AI generation failed" });
  }
}
