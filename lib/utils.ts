// Create a lib/utils.ts file and

import { Character, Scene } from "@/app/generated/prisma";
import { GoogleGenAI } from "@google/genai";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { GEMINI_15_FLASH_MODEL_NAME, generateGeminiSafetyConfig, GetGeminiApiKey } from "./llm";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Uses AI to generate a dynamic opening message for a scene-based chat.
 * @param character The character starting the chat.
 * @param scene The scene the chat takes place in.
 * @returns A dynamically generated opening message string.
 */
export async function generateSceneOpeningMessage({character,scene,userName}:
  {character: Character
  scene: Scene
  userName: string}
): Promise<string> {
  try {
    const genAI = new GoogleGenAI({ apiKey: GetGeminiApiKey() })
    const prompt = `You are the character "${character.name}". Your Instructions are: ${character.systemInstruction}. You are starting a conversation with a user in the following scene: "${scene.title}". Your instructions for this scene are: "${scene.sceneInstruction}". User preferred name is: ${userName}. Write a single, compelling opening line to say to the user to kick off the conversation based on your character and the scene. Do not add quotes around your response. Your response should be a direct statement from you, as the character.`;
    
    const result = await genAI.models.generateContent({
      model: GEMINI_15_FLASH_MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 1.0,
        maxOutputTokens: 100,
        safetySettings: generateGeminiSafetyConfig(character.nsfwTendency),
      }
    });

    if (!result || !result.text) {
      throw new Error("No response from AI model");
    }

    const responseText = result.text.trim();
    if (!responseText) {
      return character.greeting;
    }
    
    return responseText;

  } catch (error) {
    console.error("Error generating scene opening message, using fallback:", error);
    // Fallback to character's default greeting on any error
    return character.greeting;
  }
}
