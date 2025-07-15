import { initializeApp, getFirestore, Timestamp, config } from "../deps.ts";

const env = config();

const firebaseConfig = {
  credential: {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface BooleanaSession {
  id: string;
  history: { role: string; content: string }[];
  createdAt: Date;
  updatedAt?: Date;
  endedAt?: Date;
  evaluation?: any;
  status: "active" | "completed";
}

export async function saveSession(
  sessionId: string,
  history: { role: string; content: string }[],
) {
  const sessionData = {
    history,
    status: "active",
    createdAt: Timestamp.fromDate(new Date()),
  };
  
  // Cambiado a "booleana_sessions"
  await db.collection("booleana_sessions").doc(sessionId).set(sessionData);
}

export async function updateSession(
  sessionId: string,
  history: { role: string; content: string }[],
) {
  // Cambiado a "booleana_sessions"
  await db.collection("booleana_sessions").doc(sessionId).update({
    history,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

export async function endSessionInDb(
  sessionId: string,
  history: { role: string; content: string }[],
  evaluation: any
) {
  // Cambiado a "booleana_sessions"
  await db.collection("booleana_sessions").doc(sessionId).update({
    history,
    evaluation,
    status: "completed",
    endedAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

export async function getSessionById(
  sessionId: string
): Promise<BooleanaSession | null> {
  // Cambiado a "booleana_sessions"
  const doc = await db.collection("booleana_sessions").doc(sessionId).get();
  if (!doc.exists) {
    return null;
  }
  
  const data = doc.data();
  return {
    id: doc.id,
    history: data.history,
    status: data.status || "active",
    evaluation: data.evaluation,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    endedAt: data.endedAt?.toDate(),
  };
}