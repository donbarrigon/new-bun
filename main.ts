import './config/config.ts'
import { appRoutes } from './routes/routes.ts'
import { closeDB } from './app/repositories/db/mongo.ts'

const server = Bun.serve({
  port: config.serverPort,
  routes: appRoutes(),
  fetch({ url }: Request) {
    return new Response('[' + url + '] Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    })
  },
})

process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando servidor...')
  await closeDB()
  server.stop()
  process.exit(0)
})

console.log(`🚀 Servidor corriendo en http://localhost:${server.port}`)
