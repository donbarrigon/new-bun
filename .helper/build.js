import { watch } from 'fs'
import { spawn } from 'child_process'
import { readdir, copyFile, mkdir, readFile, writeFile } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

let serverProcess = null
let isDev = false

async function init() {
  const command = process.argv[2]

  switch (command) {
    case 'dev':
      isDev = true
      await setupDirectories()
      await initialBuild()
      startDevMode()
      break
    case 'build':
      await setupDirectories()
      await productionBuild()
      break
    default:
      console.log('Usage: bun build.js [dev|build]')
      process.exit(1)
  }
}

async function setupDirectories() {
  const dirs = ['public/js', 'public/css']
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }
}

async function initialBuild() {
  console.log('🚀 Realizando build inicial...')
  await Promise.all([compileScripts(), copyCSS()])
  console.log('✅ Build inicial completado')
}

async function compileScripts() {
  try {
    if (!existsSync('app/ui/resources/js')) {
      console.log('⚠️  Directorio app/ui/resources/js no existe')
      return
    }

    const files = await getFilesRecursively('app/ui/resources/js', ['.js', '.ts'])

    for (const file of files) {
      const relativePath = file.replace('app/ui/resources/js/', '')
      const outputPath = join('public/js', relativePath.replace(/\.[jt]s$/, '.js'))
      const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'))

      if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true })
      }

      const result = await Bun.build({
        entrypoints: [file],
        target: 'browser',
        minify: !isDev,
        sourcemap: isDev ? 'inline' : 'none',
        outdir: 'public/js',
        naming: relativePath.replace(/\.[jt]s$/, '.js'),
      })

      if (result.success) {
        console.log(`✅ Compilado: ${file} -> ${outputPath}`)
      } else {
        console.error(`❌ Error compilando ${file}:`, result.logs)
      }
    }
  } catch (error) {
    console.error('❌ Error en compilación de scripts:', error)
  }
}

async function copyCSS() {
  try {
    if (!existsSync('app/ui/resources/css')) {
      console.log('⚠️  Directorio app/ui/resources/css no existe')
      return
    }

    const files = await getFilesRecursively('app/ui/resources/css', '.css')

    for (const file of files) {
      const relativePath = file.replace('app/ui/resources/css/', '')
      const outputPath = join('public/css', relativePath)
      const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'))

      if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true })
      }

      let content = await readFile(file, 'utf-8')

      if (!isDev) {
        // Minificar CSS en producción
        content = content
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios
          .replace(/\s+/g, ' ') // Colapsar espacios
          .replace(/;\s*}/g, '}') // Remover último semicolon
          .replace(/\s*{\s*/g, '{') // Limpiar llaves
          .replace(/;\s*/g, ';') // Limpiar semicolons
          .trim()
      }

      await writeFile(outputPath, content)
      console.log(`✅ Copiado: ${file} -> ${outputPath}`)
    }
  } catch (error) {
    console.error('❌ Error copiando CSS:', error)
  }
}

async function getFilesRecursively(dir, extensions) {
  const files = []
  const extensionsArray = Array.isArray(extensions) ? extensions : [extensions]

  try {
    const items = await readdir(dir, { withFileTypes: true })

    for (const item of items) {
      const fullPath = join(dir, item.name)

      if (item.isDirectory()) {
        const subFiles = await getFilesRecursively(fullPath, extensions)
        files.push(...subFiles)
      } else if (extensionsArray.some((ext) => item.name.endsWith(ext))) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directorio no existe, retornar array vacío
  }

  return files
}

function startDevMode() {
  console.log('🔥 Iniciando modo desarrollo...')

  // Iniciar servidor
  startServer()

  // Watchers para diferentes directorios
  watchResources()
  watchAppFiles()
}

function startServer() {
  if (serverProcess) {
    serverProcess.kill()
  }

  console.log('🚀 Iniciando servidor...')
  serverProcess = spawn('bun', ['main.js'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })

  serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`⚠️  Servidor terminó con código ${code}`)
    }
  })
}

function watchResources() {
  // Watch script files (JS y TS)
  if (existsSync('app/ui/resources/js')) {
    watch('app/ui/resources/js', { recursive: true }, async (eventType, filename) => {
      if (filename && (filename.endsWith('.ts') || filename.endsWith('.js'))) {
        console.log(`📝 Cambio detectado en script: ${filename}`)
        await compileScripts()
      }
    })
  }

  // Watch CSS files
  if (existsSync('app/ui/resources/css')) {
    watch('app/ui/resources/css', { recursive: true }, async (eventType, filename) => {
      if (filename && filename.endsWith('.css')) {
        console.log(`🎨 Cambio detectado en CSS: ${filename}`)
        await copyCSS()
      }
    })
  }
}

function watchAppFiles() {
  const watchPaths = ['app', 'main.js', 'app.js']

  for (const path of watchPaths) {
    if (existsSync(path)) {
      watch(path, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.ts')) {
          console.log(`🔄 Cambio detectado en app: ${filename}`)
          console.log('🔃 Reiniciando servidor...')
          startServer()
        }
      })
    }
  }
}

async function productionBuild() {
  console.log('🏗️  Iniciando build de producción...')
  await Promise.all([compileScripts(), copyCSS()])
  console.log('✅ Build de producción completado')
}

// Inicializar el build manager
init().catch(console.error)

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando build manager...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando build manager...')
  process.exit(0)
})
