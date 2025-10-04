import { decode, encode } from "@msgpack/msgpack"
import { Session } from "./Session.js"
import { newToken } from "./token.js"

/**
 * Inicia una nueva sesión para un usuario
 * @param {Request} req - La solicitud HTTP
 * @param {Bun.Server} server - El servidor de Bun
 * @param {Object} user - Los datos del usuario
 * @param {Set<string>} roles - Roles del usuario
 * @param {Set<string>} permissions - Permisos del usuario
 * @returns {Promise<Session>} La sesión creada
 */
export async function sessionStart(req, server, user = {}, roles = new Set(), permissions = new Set()) {
  const { password, ...data } = user || {}

  const ip =
    server.requestIP(req)?.address ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-client-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"

  const session = new Session({
    token: newToken(),
    userID: user?._id?.toString() || undefined,
    permissions: permissions,
    roles: roles,
    data: data,
    ip: ip,
    userAgent: req.headers.get("user-agent") || "unknown",
    referer: req.headers.get("referer") || "",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + config.sessionLife),
  })

  await session.persist()
  return session
}

/**
 * Obtiene una sesión por su token
 * @param {string} id - Token de la sesión
 * @returns {Promise<Session>} La sesión encontrada
 */
export async function sessionByToken(id) {
  const filePath = tokenFilePath(id)

  try {
    const file = Bun.file(filePath)

    if (!(await file.exists())) {
      throw HttpError.unauthorized("Tu sesión ha expirado, por favor inicia sesión nuevamente")
    }

    const buffer = await file.bytes()
    const decoded = decode(buffer)

    decoded.createdAt = new Date(decoded.createdAt)
    decoded.updatedAt = new Date(decoded.updatedAt)
    decoded.expiresAt = new Date(decoded.expiresAt)

    decoded.roles = new Set(decoded.roles)
    decoded.permissions = new Set(decoded.permissions)

    const session = new Session(decoded)

    if (session.expiresAt < new Date()) {
      await Bun.file(filePath).unlink()
      throw HttpError.unauthorized("Tu sesión ha expirado, por favor inicia sesión nuevamente")
    }

    await session.refresh()
    return session
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }

    if (e?.code === "ENOENT") {
      throw HttpError.unauthorized("Tu sesión ha expirado, por favor inicia sesión nuevamente")
    }

    throw HttpError.internal(e, "Hubo un problema al recuperar tu sesión")
  }
}

/**
 * Obtiene todos los tokens de sesión de un usuario
 * @private
 * @param {string} id - ID del usuario
 * @returns {Promise<string[]>} Array de tokens
 */
async function sessionTokensByUserID(id) {
  const filePath = userFilePath(id)
  try {
    const file = Bun.file(filePath)
    if (!(await file.exists())) {
      return []
    }
    const buffer = await file.bytes()
    const decoded = decode(buffer)
    return decoded
  } catch (e) {
    throw HttpError.internal(e, "No pudimos obtener tus sesiones")
  }
}

/**
 * Obtiene todas las sesiones activas de un usuario
 * @param {string} id - ID del usuario
 * @returns {Promise<Session[]>} Array de sesiones
 */
export async function sessionsByUserID(id) {
  const tokens = await sessionTokensByUserID(id)
  const sessions = []
  for (const token of tokens) {
    const session = await sessionByToken(token)
    sessions.push(session)
  }
  return sessions
}

/**
 * Destruye todas las sesiones de un usuario por su ID
 * @param {string} id - ID del usuario
 * @returns {Promise<void>}
 */
export async function sessionDestroyAllByUserID(id) {
  const tokens = await sessionTokensByUserID(id)
  for (const token of tokens) {
    await sessionDestroyByToken(token)
  }
  const filePath = userFilePath(id)
  try {
    const file = Bun.file(filePath)
    if (await file.exists()) {
      await file.unlink()
    }
  } catch (e) {
    throw HttpError.internal(e, `No pudimos cerrar tus sesiones`)
  }
}

/**
 * Destruye una sesión específica por su token
 * @private
 * @param {string} id - Token de la sesión
 * @returns {Promise<void>}
 */
export async function sessionDestroyByToken(id) {
  const filePath = tokenFilePath(id)
  try {
    const file = Bun.file(filePath)
    if (await file.exists()) {
      await file.unlink()
    }
  } catch (e) {
    throw HttpError.internal(e, `Hubo un problema al cerrar la sesión`)
  }
}

/**
 * Remueve un token del índice de usuario
 * @private
 * @param {string} id - ID del usuario
 * @param {string} token - Token a remover
 * @returns {Promise<void>}
 */
export async function sessionRemoveTokenOfUser(id, token) {
  const tokens = await sessionTokensByUserID(id)
  const index = tokens.indexOf(token)
  if (index > -1) {
    tokens.splice(index, 1)
    const filePath = userFilePath(id)
    const encoded = encode(tokens)
    try {
      await Bun.write(filePath, encoded)
    } catch (e) {
      throw HttpError.internal(e, `Hubo un problema al cerrar la sesión`)
    }
  }
}

/**
 * Genera la ruta del archivo para un token
 * @private
 * @param {string} tk - Token de la sesión
 * @returns {string} Ruta del archivo
 */
function tokenFilePath(tk) {
  const dir = tk.slice(0, 3)
  const fileName = tk.slice(3)
  return `tmp/sessions/${dir}/${fileName}`
}

/**
 * Genera la ruta del archivo índice de un usuario
 * @private
 * @param {string} id - ID del usuario
 * @returns {string} Ruta del archivo
 */
function userFilePath(id) {
  const dir = id.slice(0, 3)
  const fileName = id.slice(3)
  return `tmp/sessions/index/${dir}/${fileName}`
}
