import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenAI({ apiKey });

export async function generateWebsite(prompt: string, options: any) {
  const modelName = options.model || "gemini-3-flash-preview";
  const fallbackModelName = "gemini-2.5-flash";

  const systemInstruction = `
    You are an elite AI web designer, UX architect, and frontend engineer.
    Your task is to generate a complete high-quality website, not just a landing page.
    Create a professional multi-page website with modern design, strong UX, and production-ready frontend code.

    WEBSITE REQUIREMENTS:
    - Generate a full responsive website including the following pages: Home, About, Services, Products or Features, Blog, Contact, Pricing (if applicable).
    - Navigation must allow switching between all pages.
    - Design a visually stunning modern website.
    - Use: clean layout, beautiful typography, smooth animations, modern color palette, glassmorphism or minimal UI, gradient backgrounds, high quality sections.
    - The site should look comparable to top startup websites.

    SECTIONS TO INCLUDE:
    - Hero section with headline and call-to-action
    - Features grid explaining product benefits
    - Testimonials or social proof
    - Pricing plans
    - Image or product gallery
    - Blog preview section
    - FAQ section
    - Contact form
    - Footer with links and social icons

    FUNCTIONALITY:
    - The website must include: responsive mobile layout, smooth scrolling, interactive buttons, hover effects, form validation, navigation menu, section animations.

    CODE REQUIREMENTS:
    - Return a complete frontend website.
    - Use: HTML5, modern CSS (flexbox or grid), vanilla JavaScript.
    - Avoid external frameworks unless necessary.
    - All styles must be included inside a style tag.
    - All scripts must be included inside a script tag.
    - Return ONLY the HTML document. No markdown fences.

    CONTENT QUALITY:
    - Write realistic marketing content for the website.
    - Use persuasive copywriting.
    - Headlines should be engaging and professional.

    PERFORMANCE:
    - Ensure the website: loads quickly, is mobile friendly, is SEO optimized, has semantic HTML tags.

    FINAL OUTPUT:
    - Return a full working website that can be opened directly in a browser.
    - Do not return explanations.
    - Return only the website code.
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

    const html = response.text.replace(/```html/g, '').replace(/```/g, '').trim();
    
    if (!html || html.length < 100) {
      throw new Error("AI generated an empty or invalid website.");
    }

    return {
      html,
      model: modelName
    };
  } catch (error: any) {
    console.error(`Error with ${modelName}:`, error);
    if (modelName !== fallbackModelName && !error.message.includes("invalid website")) {
      console.log(`Falling back to ${fallbackModelName}`);
      return generateWebsite(prompt, { ...options, model: fallbackModelName });
    }
    throw error;
  }
}
