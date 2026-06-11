import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client Lazily
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing. Please add it to the Secrets panel in AI Studio."
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// System instructions to guide the model on producing beautiful, valid, and easily animatable SVGs
const SYSTEM_INSTRUCTIONS_LOGO = `
You are a world-class professional Brand Identity Designer and SVG Vector Artist.
Your job is to generate incredibly clean, beautiful, and highly polished vector logos based on the user's company settings.

To make the logo extremely professional, adhere strictly to these rules:
1. VIEWBOX & CENTERING:
   - Use a clean viewBox="0 0 400 400" on the SVG.
   - The graphic mark and typography must be perfectly centered within this grid.
   - Leave a protective padding (margins of at least 30-40px) inside.
2. GRAPHIC ELEMENTS:
   - Prioritize elegant, simple, clever, and symbolic graphic icons or marks (e.g. geometric icons, line art, overlapping curves, abstract shapes).
   - Use premium, smooth bezier paths (<path d="..." />), circles (<circle />), polygons (<polygon />), etc.
3. GRADIENTS & STYLING:
   - ALWAYS define a clean, modern gradient inside the <defs> element. 
   - Use <linearGradient> or <radialGradient> to give a polished, realistic, 3D, neon, glassmorphism, or radiant brand depth.
   - Avoid flat basic colors unless specified. Make it premium.
4. WORDMARK & SLOGAN:
   - The logo must contain BOTH a graphic mark AND centered typography (Company Name and optional Slogan).
   - Position the Graphic Icon centrally in the upper half (vertical center around y=160 to y=180).
   - Position the Company Name centrally near the bottom (y=300 to y=320), using a clean uppercase display font (e.g. font-family="Inter, system-ui, sans-serif" or font-family="'Courier New', monospace" or font-family="'Playfair Display', Georgia, serif" depending on style). Use large bold font sizes (e.g. font-size="28" or font-size="32", font-weight="800").
   - Position the Slogan centrally below the Company Name (y=345 to y=360), with a smaller letter-spaced font (e.g. font-size="12px" or font-size="14px", letter-spacing="4", font-family="Inter, sans-serif", opacity="0.6").
5. ANIMATION COMPATIBILITY (CRITICAL):
   - To make the logos highly animatable, assign distinctive, descriptive 'id' or 'class' attributes to visual groups or paths (e.g. class="logo-path", class="brand-text", class="accent-circle", class="logo-glow-layer", class="draw-stroke").
   - Include both filled paths for scaling/reveal animations AND stroked paths with stroke-width, stroke-dashoffset, stroke-dasharray properties to support clean line-writing/drawing animations.
6. ABSOLUTE CONSTRAINTS:
   - The SVG must be entirely valid, raw inline SVG code. Do not wrap the JSON output properties in any markdown (like \`\`\`xml).
   - Ensure color contrast is excellent.
   - Never output broken SVG tags or elements nested outside of the primary <svg> wrapper.
`;

const LOGO_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    variations: {
      type: Type.ARRAY,
      description: "Array of exactly 3 distinct logo variations/concepts designed based on the rules.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique string ID (e.g. logo-1, logo-2, logo-3)." },
          vibeTitle: { type: Type.STRING, description: "A creative name of this concept variation (e.g. 'Geometric Tech Leaf', 'Sleek Minimal Crest')." },
          conceptDescription: { type: Type.STRING, description: "Detailed description of the brand message, geometric symbolism, and style rationale." },
          svgCode: {
            type: Type.STRING,
            description: "A complete, perfectly valid, self-contained SVG code starting with <svg viewBox='0 0 400 400' ...> and ending with </svg> containing graphic mark, gradients in defs, centered company name, and slogan."
          },
          primaryColor: { type: Type.STRING, description: "Hex color code used as the primary brand color in this logo (e.g. #3b82f6)." },
          secondaryColor: { type: Type.STRING, description: "Hex color code used as the secondary brand color in this logo (e.g. #10b981)." },
          backgroundColor: { type: Type.STRING, description: "Suggested canvas hex background color that makes this logo pop (usually transparent or high-contrast)." },
          badgeText: { type: Type.STRING, description: "The stylized company name text used inside the SVG." },
          ratingScore: { type: Type.INTEGER, description: "A design index score out of 100 for this concept based on the brief synergy." }
        },
        required: ["id", "vibeTitle", "conceptDescription", "svgCode", "primaryColor", "secondaryColor", "backgroundColor", "badgeText", "ratingScore"]
      }
    }
  },
  required: ["variations"]
};

// Robust runner with retry and fallback to ensure high-demand models don't crash the generation flow
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  contents: string,
  config: any
) {
  const models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Appending generation request (Model: ${model}, Attempt: ${attempt})`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        console.log(`[Gemini] Generation successfully completed with model ${model}.`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || JSON.stringify(err);
        const isTransient = errMsg.includes("503") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("overloaded") || 
                            errMsg.includes("Resource exhausted") || 
                            errMsg.includes("rate limit") || 
                            errMsg.includes("429");
        
        console.error(`[Gemini] Attempt ${attempt} failed with model ${model}:`, errMsg);
        
        if (isTransient && attempt < 2) {
          const delay = 1000 + attempt * 500;
          console.log(`[Gemini] Transient error or high load detected. Retrying model ${model} in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
    console.warn(`[Gemini] Model ${model} failed or overloaded. Progressing to fallback model...`);
  }

  throw lastError || new Error("All active Gemini AI model pipelines are currently under extremely high demand. Please wait a moment and try again.");
}

// Healthcheck endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", keyAvailable: !!process.env.GEMINI_API_KEY });
});

// Primary generation endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { companyName, slogan, industry, colorPreset, stylePreference, description } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required." });
    }

    const ai = getGeminiClient();

    const promptMessage = `
    Design exactly 3 custom, creative, distinct vector logo design proposals for my startup.
    
    Here is the brief:
    - Company Name: "${companyName}"
    - Slogan/Tagline: "${slogan || "No slogan"}"
    - Industry/Niche: "${industry || "General Startup"}"
    - Recommended Palette & Colors: "${colorPreset || "Professional Neo-Blue & Emerald"}"
    - Structural Style: "${stylePreference || "Minimalist Abstract Geometric"}"
    - Detailed Description of Vibe & Target: "${description || "A clean innovative forward-thinking enterprise."}"
    
    Design constraints to pass to your creative matrix:
    Proposal 1: Bold & Modern. Heavy focus on abstract geometric shapes, high-tech energy, and striking gradients.
    Proposal 2: Elegant & Minimal. Luxurious line-art, organic paths, fine typography, and premium subtle tones.
    Proposal 3: Creative & Playful/Literal. Whimsical elements, a clever metaphor or emblem combining the company essence, with lively interactive tones.

    Ensure every single variation contains valid inline <svg viewBox="0 0 400 400"> tags with crisp text layers matching the Company Name ("${companyName.toUpperCase()}") and Slogan ("${slogan ? slogan.toUpperCase() : ""}") appropriately nested in the coordinates!
    `;

    const response = await generateContentWithRetryAndFallback(
      ai,
      promptMessage,
      {
        systemInstruction: SYSTEM_INSTRUCTIONS_LOGO,
        responseMimeType: "application/json",
        responseSchema: LOGO_JSON_SCHEMA,
      }
    );

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini generation failed over all models:", error);
    res.status(500).json({
      error: error.message || "Failed to generate designs. Please try again in a few seconds.",
    });
  }
});

// Tweak/refinement endpoint
app.post("/api/refine", async (req, res) => {
  try {
    const { companyName, slogan, originalLogo, refinementInstructions } = req.body;

    if (!originalLogo || !refinementInstructions) {
      return res.status(400).json({ error: "Original logo and refinement instructions are required." });
    }

    const ai = getGeminiClient();

    const promptMessage = `
    You are tweaking/refining an existing logo.
    
    Original Logo Information:
    - Vibe Title: "${originalLogo.vibeTitle}"
    - Original Description: "${originalLogo.conceptDescription}"
    - Original SVG Code:
    ${originalLogo.svgCode}
    
    User Refinement Request:
    "${refinementInstructions}"
    
    Your task:
    Apply this refinement request intelligently to the original logo design.
    Modify the SVG elements (shapes, paths, dimensions, colors, gradients, font styles, or coordinates) inside the original viewBox="0 0 400 400" grid to match the user's specific request.
    Keep the core company name text ("${companyName.toUpperCase()}") and tagline intact unless specifically asked to change them.
    Ensure the resulting refined logo remains cohesive, aligned, centered, and gorgeous.
    
    Generate exactly 1 updated logo proposal representing this refined version. Name it exactly with id: "${originalLogo.id}-refined".
    `;

    const SINGLE_LOGO_SCHEMA = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        vibeTitle: { type: Type.STRING },
        conceptDescription: { type: Type.STRING },
        svgCode: { type: Type.STRING },
        primaryColor: { type: Type.STRING },
        secondaryColor: { type: Type.STRING },
        backgroundColor: { type: Type.STRING },
        badgeText: { type: Type.STRING },
        ratingScore: { type: Type.INTEGER }
      },
      required: ["id", "vibeTitle", "conceptDescription", "svgCode", "primaryColor", "secondaryColor", "backgroundColor", "badgeText", "ratingScore"]
    };

    const response = await generateContentWithRetryAndFallback(
      ai,
      promptMessage,
      {
        systemInstruction: SYSTEM_INSTRUCTIONS_LOGO,
        responseMimeType: "application/json",
        responseSchema: SINGLE_LOGO_SCHEMA,
      }
    );

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini refinement failed over all models:", error);
    res.status(500).json({
      error: error.message || "Failed to refine logo proposal. Please verify instructions and retry.",
    });
  }
});

// Vite or Static assets integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
