import './config/config.ts'
import { appRoutes } from './app/server/routes/routes.ts'
import { closeDB } from './app/server/repositories/db/mongo.ts'

const server = Bun.serve({
  port: config.serverPort,
  routes: appRoutes(),
  reusePort: true,
  fetch({ url }: Request) {
    return new Response('[' + url + '] Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    })
  },
})

process.on('SIGINT', async () => {
  console.log(`${config.workerTag}👋 Cerrando servidor...`)
  await closeDB()
  server.stop()
  process.exit(0)
})

console.log(`${config.workerTag}🚀 Servidor corriendo en el puerto:${server.port}`)
