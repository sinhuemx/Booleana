import { OpenAI } from "../deps.ts";
import { config } from "../deps.ts";

const env = config();
const openai = new OpenAI(env.OPENAI_API_KEY);

// Función mejorada para generar respuestas con Seeker
export async function generateResponse(
  messages: { role: "system" | "assistant" | "user"; content: string }[],
): Promise<string> {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      maxTokens: 256,
      stop: ["\nCandidate:", "\nSeeker:"]
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Seeker: OpenAI API error:", error);
    return "Te responde Deno...mientras me conectaran un LLM :)";
  }
}