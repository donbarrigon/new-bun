import { spawn } from 'bun'

const cpus = navigator.hardwareConcurrency
const buns = new Array(cpus)

console.log(`⚡⚡ Iniciando ${cpus} clusters de Bun ⚡⚡`)

for (let i = 0; i < cpus; i++) {
  buns[i] = spawn({
    cmd: ['bun', './app.ts'],
    env: {
      ...process.env,
      WORKER_ID: String(i + 1), // ✨ Pasar ID del worker
      WORKER_CPUS: String(cpus),
    },
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  })
}

async function shutdown() {
  console.log('\n⚡ Cerrando clusters...')

  const shutdownPromises = buns.map((bun, i) => {
    bun.kill('SIGINT')
    return bun.exited.then(() => {
      console.log(`✓ Worker ${i + 1} cerrado`)
    })
  })

  const timeout = Bun.sleep(5000).then(() => {
    console.log('⚠️  Timeout alcanzado, forzando cierre')
  })

  await Promise.race([Promise.all(shutdownPromises), timeout])

  for (const bun of buns) {
    if (!bun.exitCode) {
      bun.kill('SIGKILL')
    }
  }

  console.log('👋 Cluster cerrado')
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
