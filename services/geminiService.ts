import { GoogleGenAI } from "@google/genai";
import { UploadedImage, ImageMetadata } from "../types";

/**
 * Analyze the background image to get a descriptive prompt.
 */
const analyzeBackgroundStyle = async (ai: GoogleGenAI, image: UploadedImage): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Analyze this image and describe the background environment, lighting, art style, and mood in extreme detail.
    Ignore any main subjects (people/animals), focus ONLY on the setting/scenery.
    
    Output a high-quality image generation prompt that would recreate this exact atmosphere and background.
    Include details about:
    1. Lighting (Direction, Color, Intensity, Softness)
    2. Environment (Location, Time of day, Weather)
    3. Color Palette and Artistic Style
    
    Format: Return only the descriptive prompt text.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: image.mimeType, data: image.base64 } }
      ]
    }
  });

  return response.text || "A high quality photorealistic background.";
};

/**
 * Generates a new image placing the person into a generated background based on the reference.
 */
export const generateCompositeImage = async (
  personImage: UploadedImage,
  backgroundImage: UploadedImage,
  resolution: '1K' | '2K' | '4K' = '1K'
): Promise<{ image: string; metadata: ImageMetadata }> => {
  const startTime = Date.now();
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Step 1: Analyze the background image to get a style description
    const backgroundPrompt = await analyzeBackgroundStyle(ai, backgroundImage);
    
    // Step 2: Generate the final image using the person and the background description
    const model = 'gemini-3-pro-image-preview';

    const finalPrompt = `
      Create a high-quality photorealistic image.

      TASK:
      Composite the PERSON from the input image into the new background described below.

      CRITICAL INSTRUCTION - SUBJECT PRESERVATION:
      - The subject (person) must be IDENTICAL to the reference image in terms of POSE, COMPOSITION, CAMERA ANGLE, CLOTHING TEXTURE, and DETAILS.
      - Do NOT change the clothing wrinkles, patterns, or fabric.
      - Do NOT change the facial expression or identity.
      - The subject's silhouette and position in the frame should remain exactly the same.

      ENVIRONMENT DESCRIPTION:
      ${backgroundPrompt}

      LIGHTING & INTEGRATION:
      - Adapt the lighting on the person to match the new environment (direction, color, intensity).
      - Ensure realistic shadows and reflections based on the new background.
      - The goal is seamless photorealistic integration without altering the subject's physical appearance.

      Input Image is the Subject Reference.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: finalPrompt },
          {
            inlineData: {
              mimeType: personImage.mimeType,
              data: personImage.base64,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          imageSize: resolution,
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          
          return {
            image: `data:${mimeType};base64,${base64Data}`,
            metadata: {
              prompt: backgroundPrompt,
              model: model,
              resolution: resolution,
              generationTime: Date.now() - startTime
            }
          };
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

/**
 * Helper to convert File to Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};