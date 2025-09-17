import initConfig from './config/config.ts'
import { appRoutes } from './routes/appRoutes.ts'
import { connectDB, closeDB } from './app/repositories/repository.ts'
import { publicFiles } from './app/controllers/home.ts'

initConfig()
connectDB()

const server = Bun.serve({
  port: config.serverPort,
  routes: appRoutes(),
  fetch({}: Request) {
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
