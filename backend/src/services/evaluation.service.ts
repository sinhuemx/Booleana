import { OpenAI } from "../deps.ts";
import { config } from "../deps.ts";

const env = config();
if (!env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}
const openai = new OpenAI(env.OPENAI_API_KEY);

export interface Evaluation {
  technicalScore: number;
  communicationScore: number;
  strengths: string[];
  areasForImprovement: string[];
  keywords: string[];
  summary: string;
}

// Evaluar la entrevista completa
export async function evaluateInterview(
  history: { role: string; content: string }[]
): Promise<Evaluation> {
  try {
    // Solo permitimos los roles válidos para OpenAI
    const validRoles = ["system", "assistant", "user"] as const;

    const messages = [
      ...history
        .filter(m => validRoles.includes(m.role as typeof validRoles[number]))
        .map(m => ({
          role: m.role as "system" | "assistant" | "user",
          content: m.content
        })),
      {
        role: "system" as const,
        content: `Eres Booleana Analytics, un módulo especializado en evaluar entrevistas técnicas. 
        Analiza la conversación y genera un reporte JSON con:
        - technicalScore (1-5): Dominio técnico demostrado
        - communicationScore (1-5): Claridad en respuestas
        - strengths: [3 habilidades principales]
        - areasForImprovement: [3 áreas a mejorar]
        - keywords: [palabras clave técnicas mencionadas]
        - summary: Resumen de 3 líneas máximo
        
        Ejemplo de formato: 
        {
          "technicalScore": 4.2,
          "communicationScore": 3.8,
          "strengths": ["Angular", "Firebase", "SOLID"],
          "areasForImprovement": ["Testing", "Performance optimization", "CI/CD"],
          "keywords": ["RxJS", "Firestore", "TypeScript"],
          "summary": "Candidato con buena experiencia en frontend..."
        }`
      }
    ];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.2,
      maxTokens: 512
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("No evaluation content returned from OpenAI");

    const evaluation: Evaluation = JSON.parse(content);
    return evaluation;
  } catch (error) {
    console.error("Booleana: Error evaluating interview:", error);
    return {
      technicalScore: 0,
      communicationScore: 0,
      strengths: [],
      areasForImprovement: [],
      keywords: [],
      summary: "Error en evaluación"
    };
  }
}