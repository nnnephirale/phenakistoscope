
import { GoogleGenAI } from "@google/genai";
import { promptConfig } from "../promptConfig";

export const generateVoxelPortrait = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Randomly select a variant
  const randomVariant = promptConfig.variants[Math.floor(Math.random() * promptConfig.variants.length)];
  const fullPrompt = `${promptConfig.basePrompt} Style Variant: ${randomVariant}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/png',
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data returned from API");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
