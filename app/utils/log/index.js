import { appendFile, readdir, unlink } from "node:fs/promises"
import { join } from "node:path"

export const LV_EMERGENCY = 0
export const LV_ALERT = 1
export const LV_CRITICAL = 2
export const LV_ERROR = 3
export const LV_WARNING = 4
export const LV_NOTICE = 5
export const LV_INFO = 6
export const LV_DEBUG = 7
export const LV_OFF = 8
export const RESET = LV_OFF

export const LOG_LEVEL = {
  [LV_EMERGENCY]: "EMERGENCY",
  [LV_ALERT]: "ALERT",
  [LV_CRITICAL]: "CRITICAL",
  [LV_ERROR]: "ERROR",
  [LV_WARNING]: "WARNING",
  [LV_NOTICE]: "NOTICE",
  [LV_INFO]: "INFO",
  [LV_DEBUG]: "DEBUG",
}

const LOG_COLOR = {
  [LV_EMERGENCY]: "\x1b[91m", // rojo brillante
  [LV_ALERT]: "\x1b[31m", // rojo
  [LV_CRITICAL]: "\x1b[35m", // magenta
  [LV_ERROR]: "\x1b[91m", // rojo brillante (igual que emergency)
  [LV_WARNING]: "\x1b[33m", // amarillo
  [LV_NOTICE]: "\x1b[92m", // verde claro
  [LV_INFO]: "\x1b[34m", // azul
  [LV_DEBUG]: "\x1b[90m", // gris
  [LOG_OFF]: "\x1b[0m", // reset
}

const logPath = "tmp/logs/"

/**
 * Guarda un log con nivel de emergencia
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logEmergency(msg, e) {
  if (LV_EMERGENCY > config.logLevel) return
  await save(LV_EMERGENCY, msg, e)
}

/**
 * Guarda un log con nivel de alerta
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logAlert(msg, e) {
  if (LV_ALERT > config.logLevel) return
  await save(LV_ALERT, msg, e)
}

/**
 * Guarda un log con nivel de critical
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logCritical(msg, e) {
  if (LV_CRITICAL > config.logLevel) return
  await save(LV_CRITICAL, msg, e)
}

/**
 * Guarda un log con nivel de error
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logError(msg, e) {
  if (LV_ERROR > config.logLevel) return
  await save(LV_ERROR, msg, e)
}

/**
 * Guarda un log con nivel de warning
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logWarning(msg, e) {
  if (LV_WARNING > config.logLevel) return
  await save(LV_WARNING, msg, e)
}

/**
 * Guarda un log con nivel de notice
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logNotice(msg, e) {
  if (LV_NOTICE > config.logLevel) return
  await save(LV_NOTICE, msg, e)
}

/**
 * Guarda un log con nivel de info
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logInfo(msg, e) {
  if (LV_INFO > config.logLevel) return
  await save(LV_INFO, msg, e)
}

/**
 * Guarda un log con nivel de debug
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logDebug(msg, e) {
  if (LV_DEBUG > config.logLevel) return
  await save(LV_DEBUG, msg, e)
}

/**
 * Solo escribe en consola
 * @param {string | object} msg - Mensaje o valor serializable a json
 * @param {Error} [e] - Error a guardar en el log (opcional)
 * @returns {Promise<void>}
 */
export async function logPrint(msg, e) {
  await save(LOG_OFF, msg, e)
}

/**
 * funcion para guardar en archivo
 * @param {number} lv
 * @param {string | object} msg
 * @param {Error} e
 * @returns {Promise<void>}
 */
async function save(lv, msg, e) {
  if (typeof msg === "object") {
    msg = JSON.stringify(msg)
  } else {
    msg = String(msg).replace(/[\r\n"\\]/g, "")
  }
  const time = new Date().toISOString()
  const level = LOG_LEVEL[lv]
  const err = dumpError(e)

  if (config.logPrint) {
    console.log(`${time} [${LOG_COLOR[lv]}${level}${LOG_COLOR[RESET]}] ${msg}\n${err}`)
  }

  const data = `{"time":"${time}","level":"${level}","message":"${msg}","error":"${err}"}\n`
  const date = new Date().toISOString().slice(0, 10)
  const fileName = `${logPath}${date}.log`
  await appendFile(fileName, data, "utf8")
}

/**
 * toma todas las propiedades de un error y las convierte en json
 * @param {Error} e
 * @returns {string}
 */
function dumpError(e) {
  if (e instanceof Error) {
    const result = {}

    // 1. Obtener propiedades propias
    const ownKeys = Object.getOwnPropertyNames(e)
    for (const key of ownKeys) {
      try {
        result[key] = e[key]
      } catch {
        result[key] = "[No pudimos leer esto]"
      }
    }

    // 2. Obtener propiedades del prototipo (heredadas)
    let proto = Object.getPrototypeOf(e)
    while (proto && proto !== Object.prototype && proto !== Error.prototype) {
      const protoKeys = Object.getOwnPropertyNames(proto)
      for (const key of protoKeys) {
        if (!result[key] && key !== "constructor") {
          try {
            result[key] = e[key]
          } catch {
            result[key] = "[No pudimos leer esto]"
          }
        }
      }
      proto = Object.getPrototypeOf(proto)
    }

    // 3. Agregar el nombre de la clase
    result._className = e.constructor.name
    return JSON.stringify(result)
  }
  return ""
}

/**
 * Limpia los logs antiguos se refresca cada 24 horas
 * utiliza config.logDays para saber cuantos dias se guardan
 */
async function cleanOldLogs() {
  try {
    const files = await readdir(logPath)
    const today = new Date()
    const cutoffDate = new Date(today)
    cutoffDate.setDate(cutoffDate.getDate() - config.logDays)
    const cutoffStr = cutoffDate.toISOString().slice(0, 10)

    for (const file of files) {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})\.log$/)
      if (!match) continue

      const fileDate = match[1]
      if (fileDate < cutoffStr) {
        await unlink(join(logPath, file))
        console.log(`Log eliminado: ${file}`)
      }
    }
  } catch (error) {
    console.error("Error limpiando logs:", error)
  }
  setTimeout(cleanOldLogs, 86400000)
}
cleanOldLogs()
