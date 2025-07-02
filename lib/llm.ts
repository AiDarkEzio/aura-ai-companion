// lib/llm.ts

import { NsfwTendency } from "@/app/generated/prisma";
import { HarmBlockThreshold, HarmCategory, SafetySetting } from "@google/genai";

export const GetGeminiApiKey = () => {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  } else {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
}

export const GEMINI_15_FLASH_MODEL_NAME = "gemini-1.5-flash";

const levelToThresholdMap: Record< NsfwTendency, HarmBlockThreshold> = {
  NONE: HarmBlockThreshold.BLOCK_NONE,
  LOW: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  MEDIUM: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  HIGH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
};

/**
 * Generates a safety settings array for the Google Gemini API based on a predefined level.
 */
export const generateGeminiSafetyConfig = (level: keyof typeof levelToThresholdMap): SafetySetting[] => {
    const threshold = levelToThresholdMap[level];

    const categories = [
        HarmCategory.HARM_CATEGORY_HARASSMENT,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    ];

    return categories.map(category => ({
        category,
        threshold,
    }));
}