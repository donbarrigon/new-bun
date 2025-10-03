import "./config/config.js";
import { appRoutes } from "./app/server/routes/routes.ts";
import { closeDB } from "./app/utils/db/mongo.js";

const server = Bun.serve({
  port: config.serverPort,
  routes: appRoutes(),
  reusePort: true,
  fetch(req) {
    return new Response("[" + req.url + "] Not found", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  },
});

process.on("SIGINT", async () => {
  console.log(`${config.workerTag}👋 Cerrando servidor...`);
  await closeDB();
  server.stop();
  process.exit(0);
});

console.log(
  `${config.workerTag}🚀 Servidor corriendo en http://${server.hostname}:${server.port}`
);
