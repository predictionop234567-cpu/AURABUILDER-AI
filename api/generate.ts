import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenAI({ apiKey });

export async function generateWebsite(prompt: string, options: any) {
  const modelName = options.model || "gemini-1.5-pro-latest";
  const fallbackModelName = "gemini-1.5-flash";

  const systemInstruction = `
    You are AURABUILDER AI, a world-class website generator.
    Generate a COMPLETE, professional, responsive HTML document based on the user's prompt.
    
    RULES:
    - Return ONLY the HTML document. No markdown fences.
    - Include all CSS in a <style> tag in the <head>.
    - Include any necessary JS in a <script> tag before </body>.
    - Use modern, clean design (Tailwind-like utility classes are NOT available, use standard CSS).
    - Ensure mobile responsiveness.
    - Use semantic HTML5.
    - Images: Use https://picsum.photos/seed/{keyword}/1200/800 for images.
    - Style: ${options.style || 'Modern'}.
    - Type: ${options.type || 'Landing Page'}.
    - Brand: ${options.brandName || 'My Brand'}.
    
    The website should have multiple sections: Hero, Features, About, Contact, Footer.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    return {
      html: response.text.replace(/```html/g, '').replace(/```/g, '').trim(),
      model: modelName
    };
  } catch (error) {
    console.error(`Error with ${modelName}:`, error);
    if (modelName !== fallbackModelName) {
      console.log(`Falling back to ${fallbackModelName}`);
      return generateWebsite(prompt, { ...options, model: fallbackModelName });
    }
    throw error;
  }
}
