import routes from './routes/routes.ts'
import initConfig from './config/config.ts'
import { connectDB, closeDB } from './app/repositories/db.ts'
import { staticFiles } from './app/controllers/home.ts'

initConfig()
connectDB()

const server = Bun.serve({
  port: config.serverPort,
  routes: routes(),
  fetch(req: Request) {
    const url = new URL(req.url)
    if (url.pathname.startsWith('/public/')) {
      return staticFiles(req)
    }
    return new Response('Not found', {
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
