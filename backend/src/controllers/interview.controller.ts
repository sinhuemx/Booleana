import { Context, v4 } from "../deps.ts";
import { generateResponse } from "../services/openai.service.ts";
import { 
  saveSession, 
  updateSession,
  getSessionById,
  endSessionInDb
} from "../services/firebase.service.ts";
import { evaluateInterview } from "../services/evaluation.service.ts";

interface Message {
  role: "system" | "assistant" | "user";
  content: string;
}

interface BooleanaSession {
  id: string;
  history: Message[];
  status: "active" | "completed";
  evaluation?: unknown;
}

const sessions = new Map<string, BooleanaSession>();

/**
 * Helper to get a session from memory or Firebase.
 * O(1) for memory, O(1) for Firebase (assuming indexed).
 */
async function fetchSession(sessionId: string): Promise<BooleanaSession | null> {
  let session = sessions.get(sessionId);
  if (session) return session;

  const firebaseSession = await getSessionById(sessionId);
  if (!firebaseSession) return null;

  session = {
    id: sessionId,
    history: firebaseSession.history.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "system" | "assistant" | "user",
        content: msg.content,
      })
    ),
    status: firebaseSession.status,
    evaluation: firebaseSession.evaluation,
  };
  sessions.set(sessionId, session);
  return session;
}

export async function startSession(ctx: Context): Promise<void> {
  try {
    const sessionId = v4();
    const systemPrompt = `Eres Booleana, un reclutador técnico especializado en TI. Evalúa habilidades técnicas, experiencia y fit cultural. 
Comienza con una presentación breve y haz 1 pregunta a la vez. Pregunta sobre: 
- Experiencia con Angular/TypeScript 
- Conocimiento de Firebase 
- Metodologías ágiles 
- Resolución de problemas técnicos

Tu nombre es Booleana y trabajas para la empresa TechCorp. 
Saluda al candidato y presenta la sesión de entrevista.`;

    const initialHistory: Message[] = [
      { role: "system", content: systemPrompt },
    ];

    const firstMessage = await generateResponse(initialHistory);
    initialHistory.push({ role: "assistant", content: firstMessage });

    const session: BooleanaSession = {
      id: sessionId,
      history: initialHistory,
      status: "active"
    };

    sessions.set(sessionId, session);
    await saveSession(sessionId, initialHistory);

    ctx.response.body = {
      sessionId,
      message: firstMessage,
      status: "active"
    };
  } catch (error) {
    console.error("Booleana: Error starting session:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

export async function handleMessage(ctx: Context): Promise<void> {
  try {
    const { sessionId, message } = await ctx.request.body({ type: "json" }).value;
    if (!sessionId || !message) {
      ctx.response.status = 400;
      ctx.response.body = { error: "sessionId and message are required" };
      return;
    }

    const session = await fetchSession(sessionId);
    if (!session) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Session not found" };
      return;
    }

    session.history.push({ role: "user", content: message });

    const assistantMessage = await generateResponse(session.history);
    session.history.push({ role: "assistant", content: assistantMessage });

    await updateSession(sessionId, session.history);

    ctx.response.body = {
      message: assistantMessage,
      status: session.status,
    };
  } catch (error) {
    console.error("Booleana: Error handling message:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

export async function endSession(ctx: Context): Promise<void> {
  try {
    const { sessionId } = await ctx.request.body({ type: "json" }).value;
    if (!sessionId) {
      ctx.response.status = 400;
      ctx.response.body = { error: "sessionId is required" };
      return;
    }

    const session = await fetchSession(sessionId);
    if (!session) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Session not found" };
      return;
    }

    const evaluation = await evaluateInterview(session.history);

    session.status = "completed";
    session.evaluation = evaluation;

    await endSessionInDb(sessionId, session.history, evaluation);

    ctx.response.body = {
      status: "completed",
      evaluation,
    };
  } catch (error) {
    console.error("Booleana: Error ending session:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

export async function getSession(ctx: Context): Promise<void> {
  try {
    // Extrae el sessionId de la URL, e.g., /session/:sessionId
    const urlParts = ctx.request.url.pathname.split("/");
    const sessionId = urlParts[urlParts.length - 1];
    if (!sessionId) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Session ID is required" };
      return;
    }

    const session = await fetchSession(sessionId);
    if (!session) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Session not found" };
      return;
    }

    ctx.response.body = {
      sessionId: session.id,
      history: session.history,
      status: session.status,
      evaluation: session.evaluation,
    };
  } catch (error) {
    console.error("Booleana: Error getting session:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}