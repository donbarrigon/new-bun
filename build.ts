import { watch } from 'fs'
import { spawn, ChildProcess } from 'child_process'
import { readdir, copyFile, mkdir, readFile, writeFile } from 'fs/promises'
import { join, extname, basename } from 'path'
import { existsSync } from 'fs'

class BuildManager {
  private serverProcess: ChildProcess | null = null
  private isDev = false

  async init() {
    const command = process.argv[2]

    switch (command) {
      case 'dev':
        this.isDev = true
        await this.setupDirectories()
        await this.initialBuild()
        this.startDevMode()
        break
      case 'build':
        await this.setupDirectories()
        await this.productionBuild()
        break
      default:
        console.log('Usage: bun build.ts [dev|build]')
        process.exit(1)
    }
  }

  private async setupDirectories() {
    const dirs = ['public/js', 'public/css']
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
    }
  }

  private async initialBuild() {
    console.log('🚀 Realizando build inicial...')
    await Promise.all([this.compileTypeScript(), this.copyCSS()])
    console.log('✅ Build inicial completado')
  }

  private async compileTypeScript() {
    try {
      if (!existsSync('app/ui/resources/ts')) {
        console.log('⚠️  Directorio app/ui/resources/ts no existe')
        return
      }

      const files = await this.getFilesRecursively('app/ui/resources/ts', '.ts')

      for (const file of files) {
        const relativePath = file.replace('app/ui/resources/ts/', '')
        const outputPath = join('public/js', relativePath.replace('.ts', '.js'))
        const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'))

        if (!existsSync(outputDir)) {
          await mkdir(outputDir, { recursive: true })
        }

        const result = await Bun.build({
          entrypoints: [file],
          target: 'browser',
          minify: !this.isDev,
          sourcemap: this.isDev ? 'inline' : 'none',
          outdir: 'public/js',
          naming: relativePath.replace('.ts', '.js'),
        })

        if (result.success) {
          console.log(`✅ Compilado: ${file} -> ${outputPath}`)
        } else {
          console.error(`❌ Error compilando ${file}:`, result.logs)
        }
      }
    } catch (error) {
      console.error('❌ Error en compilación TypeScript:', error)
    }
  }

  private async copyCSS() {
    try {
      if (!existsSync('app/ui/resources/css')) {
        console.log('⚠️  Directorio app/ui/resources/css no existe')
        return
      }

      const files = await this.getFilesRecursively('app/ui/resources/css', '.css')

      for (const file of files) {
        const relativePath = file.replace('app/ui/resources/css/', '')
        const outputPath = join('public/css', relativePath)
        const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'))

        if (!existsSync(outputDir)) {
          await mkdir(outputDir, { recursive: true })
        }

        let content = await readFile(file, 'utf-8')

        if (!this.isDev) {
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

  private async getFilesRecursively(dir: string, extension: string): Promise<string[]> {
    const files: string[] = []

    try {
      const items = await readdir(dir, { withFileTypes: true })

      for (const item of items) {
        const fullPath = join(dir, item.name)

        if (item.isDirectory()) {
          const subFiles = await this.getFilesRecursively(fullPath, extension)
          files.push(...subFiles)
        } else if (extname(item.name) === extension) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directorio no existe, retornar array vacío
    }

    return files
  }

  private startDevMode() {
    console.log('🔥 Iniciando modo desarrollo...')

    // Iniciar servidor
    this.startServer()

    // Watchers para diferentes directorios
    this.watchResources()
    this.watchAppFiles()
  }

  private startServer() {
    if (this.serverProcess) {
      this.serverProcess.kill()
    }

    console.log('🚀 Iniciando servidor...')
    this.serverProcess = spawn('bun', ['main.ts'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    this.serverProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.log(`⚠️  Servidor terminó con código ${code}`)
      }
    })
  }

  private watchResources() {
    // Watch TypeScript files
    if (existsSync('app/ui/resources/ts')) {
      watch('app/ui/resources/ts', { recursive: true }, async (eventType, filename) => {
        if (filename && filename.endsWith('.ts')) {
          console.log(`📝 Cambio detectado en TS: ${filename}`)
          await this.compileTypeScript()
        }
      })
    }

    // Watch CSS files
    if (existsSync('app/ui/resources/css')) {
      watch('app/ui/resources/css', { recursive: true }, async (eventType, filename) => {
        if (filename && filename.endsWith('.css')) {
          console.log(`🎨 Cambio detectado en CSS: ${filename}`)
          await this.copyCSS()
        }
      })
    }
  }

  private watchAppFiles() {
    const watchPaths = ['app', 'main.ts', 'app.ts']

    for (const path of watchPaths) {
      if (existsSync(path)) {
        watch(path, { recursive: true }, (eventType, filename) => {
          if (filename && filename.endsWith('.ts')) {
            console.log(`🔄 Cambio detectado en app: ${filename}`)
            console.log('🔃 Reiniciando servidor...')
            this.startServer()
          }
        })
      }
    }
  }

  private async productionBuild() {
    console.log('🏗️  Iniciando build de producción...')

    await Promise.all([this.compileTypeScript(), this.copyCSS()])

    console.log('✅ Build de producción completado')
  }
}

// Inicializar el build manager
const buildManager = new BuildManager()
buildManager.init().catch(console.error)

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando build manager...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando build manager...')
  process.exit(0)
})
