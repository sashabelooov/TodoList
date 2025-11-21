import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

/**
 * Edits an image using Gemini 2.5 Flash Image model.
 * @param base64Image The base64 string of the original image.
 * @param mimeType The mime type of the image (e.g., image/png).
 * @param prompt The user's instruction for editing.
 * @returns A promise resolving to the base64 string of the edited image or undefined.
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | undefined> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return undefined;
  } catch (error) {
    console.error("Error interacting with Gemini API:", error);
    throw error;
  }
};
