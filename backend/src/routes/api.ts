import { Router } from "../deps.ts";
import {
  startSession,
  handleMessage,
  endSession,
  getSession,
} from "../controllers/interview.controller.ts";

export const apiRouter = new Router();

apiRouter
  .post("/session", startSession)
  .post("/interview", handleMessage)
  .post("/session/:id/end", endSession)
  .get("/session/:id", getSession)
  .get("/status", (context) => {
    context.response.body = { status: "Backend is running", service: "Booleana AI" };
  });