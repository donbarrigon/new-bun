import { initGlobals } from './config/config.ts'
import { appRoutes } from './routes/app-routes.ts'
import { connectDB, closeDB } from './app/shared/db/db.ts'

initGlobals()
connectDB()

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
