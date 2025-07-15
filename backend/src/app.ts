import { Application } from "./deps.ts";
import { apiRouter } from "./routes/api.ts";

const app = new Application();

// Middleware de logs
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Middleware de tiempo de respuesta
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Middleware CORS
app.use(async (ctx, next) => {
  const origin = ctx.request.headers.get("Origin") || "*";
  ctx.response.headers.set("Access-Control-Allow-Origin", origin);
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  
  // Manejar solicitudes preflight
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No Content
    return;
  }
  
  await next();
});

// Rutas
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

const PORT = 8000;
console.log(`Booleana AI Backend running on http://localhost:${PORT}`);
await app.listen({ port: PORT });