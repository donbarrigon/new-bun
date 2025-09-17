#!/usr/bin/env bun

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import * as readline from 'readline'

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

// Función para crear interface de readline
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

// Función para hacer preguntas
function askQuestion(question: string): Promise<string> {
  const rl = createReadlineInterface()
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// Función para validar el formato del nombre del proyecto
function validateProjectName(name: string): boolean {
  const regex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
  return regex.test(name)
}

// Función para ejecutar comandos con manejo de errores
function executeCommand(command: string, description?: string): void {
  try {
    if (description) {
      console.log(`${colors.cyan}${description}${colors.reset}`)
    }
    console.log(`${colors.yellow}Ejecutando: ${command}${colors.reset}`)
    execSync(command, { stdio: 'inherit' })
    console.log(`${colors.green}✓ Comando ejecutado exitosamente${colors.reset}\n`)
  } catch (error) {
    console.error(`${colors.red}✗ Error ejecutando: ${command}${colors.reset}`)
    console.error(`${colors.red}${error}${colors.reset}`)
    process.exit(1)
  }
}

// Función para verificar que existe package.json
function checkPackageJson(): void {
  if (!existsSync('package.json')) {
    console.error(
      `${colors.red}✗ No se encontró package.json en el directorio actual${colors.reset}`
    )
    process.exit(1)
  }
}

// Función para actualizar el name en package.json
function updatePackageJson(projectName: string): void {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const projectNameOnly = projectName.split('/')[1]
    packageJson.name = projectNameOnly

    writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
    console.log(
      `${colors.green}✓ package.json actualizado - name: ${projectNameOnly}${colors.reset}\n`
    )
  } catch (error) {
    console.error(`${colors.red}✗ Error actualizando package.json: ${error}${colors.reset}`)
    process.exit(1)
  }
}

// Función para obtener y validar el nombre del proyecto
async function getProjectName(): Promise<string> {
  while (true) {
    const projectName = await askQuestion(
      `${colors.blue}Ingresa el nombre del proyecto (formato: usuarioDeGit/nombreDelProyecto): ${colors.reset}`
    )

    if (!projectName) {
      console.log(`${colors.red}✗ El nombre del proyecto no puede estar vacío${colors.reset}`)
      continue
    }

    if (!validateProjectName(projectName)) {
      console.log(
        `${colors.red}✗ Formato incorrecto. Usa el formato: usuarioDeGit/nombreDelProyecto${colors.reset}`
      )
      continue
    }

    return projectName
  }
}

// Comando init
async function initCommand(): Promise<void> {
  console.log(`${colors.bold}${colors.magenta}🚀 Inicializando nuevo proyecto${colors.reset}\n`)

  checkPackageJson()
  const projectName = await getProjectName()

  console.log(
    `\n${colors.bold}Iniciando configuración del proyecto: ${projectName}${colors.reset}\n`
  )

  // 1. Actualizar package.json
  updatePackageJson(projectName)

  // 2. Eliminar historial de Git
  executeCommand('rm -rf .git', '📁 Eliminando historial de Git existente')

  // 3. Inicializar nuevo repositorio Git
  executeCommand('git init', '🔧 Inicializando nuevo repositorio Git')
  executeCommand('git add .', '📦 Agregando archivos al staging')
  executeCommand(
    'git commit -m "feat: initial commit from donbarrigon/new-bun"',
    '💾 Realizando commit inicial'
  )

  // 4. Añadir repositorio remoto
  executeCommand(
    `git remote add origin https://github.com/${projectName}.git`,
    '🔗 Añadiendo repositorio remoto'
  )
  executeCommand('git push -u origin main', '🚀 Subiendo cambios al repositorio remoto')

  // 5. Instalar dependencias
  executeCommand('bun install', '📦 Instalando dependencias')

  console.log(`${colors.bold}${colors.green}🎉 Proyecto inicializado exitosamente!${colors.reset}`)
}

// Comando fork
async function forkCommand(): Promise<void> {
  console.log(`${colors.bold}${colors.magenta}🍴 Configurando fork del proyecto${colors.reset}\n`)

  checkPackageJson()
  const projectName = await getProjectName()

  console.log(`\n${colors.bold}Configurando fork para: ${projectName}${colors.reset}\n`)

  // 1. Actualizar package.json
  updatePackageJson(projectName)

  // 2. Renombrar origin a upstream
  executeCommand('git remote rename origin upstream', '🔄 Renombrando origin a upstream')

  // 3. Añadir nuevo origin
  executeCommand(
    `git remote add origin https://github.com/${projectName}.git`,
    '🔗 Añadiendo nuevo repositorio origin'
  )

  // 4. Commit y push
  executeCommand('git add .', '📦 Agregando cambios al staging')
  executeCommand(
    'git commit -m "feat: initial commit from donbarrigon/new-bun"',
    '💾 Realizando commit inicial'
  )
  executeCommand('git push -u origin main', '🚀 Subiendo cambios al repositorio remoto')

  // 5. Instalar dependencias
  executeCommand('bun install', '📦 Instalando dependencias')

  console.log(`${colors.bold}${colors.green}🎉 Fork configurado exitosamente!${colors.reset}`)
}

// Comando update
function updateCommand(): void {
  console.log(`${colors.bold}${colors.magenta}🔄 Actualizando desde upstream${colors.reset}\n`)

  executeCommand('git fetch upstream', '📥 Obteniendo cambios del upstream')
  executeCommand('git merge upstream/main', '🔀 Fusionando cambios del upstream')

  console.log(`${colors.bold}${colors.green}🎉 Actualización completada!${colors.reset}`)
}

// Función para mostrar ayuda
function showHelp(): void {
  console.log(`${colors.bold}${colors.cyan}Helper CLI - Asistente para proyectos${colors.reset}\n`)
  console.log(`${colors.bold}Uso:${colors.reset}`)
  console.log(`  bun helper <comando>\n`)
  console.log(`${colors.bold}Comandos disponibles:${colors.reset}`)
  console.log(`  ${colors.green}init${colors.reset}     Inicializar un nuevo proyecto desde kit`)
  console.log(`  ${colors.green}fork${colors.reset}     Configurar un fork del proyecto actual`)
  console.log(`  ${colors.green}update${colors.reset}   Actualizar desde el repositorio upstream`)
  console.log(`  ${colors.green}help${colors.reset}     Mostrar esta ayuda\n`)
  console.log(`${colors.bold}Ejemplos:${colors.reset}`)
  console.log(`  bun helper init`)
  console.log(`  bun helper fork`)
  console.log(`  bun helper update`)
}

// Función principal
async function main(): Promise<void> {
  const command = process.argv[2]

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp()
    return
  }

  try {
    switch (command) {
      case 'init':
        await initCommand()
        break
      case 'fork':
        await forkCommand()
        break
      case 'update':
        updateCommand()
        break
      default:
        console.error(`${colors.red}✗ Comando desconocido: ${command}${colors.reset}\n`)
        showHelp()
        process.exit(1)
    }
  } catch (error) {
    console.error(`${colors.red}✗ Error inesperado: ${error}${colors.reset}`)
    process.exit(1)
  }
}

// Ejecutar la función principal
main().catch((error) => {
  console.error(`${colors.red}✗ Error fatal: ${error}${colors.reset}`)
  process.exit(1)
})
