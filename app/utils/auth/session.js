import { BSON } from 'mongodb'
import { newToken } from './token.js'
import { encode, decode } from '@msgpack/msgpack'

/**
 * Clase para manejar sesiones de usuario
 */
export class Session {
  /**
   * Crea una nueva instancia de sesión
   * @param {Object} options - Opciones de configuración
   * @param {string} options.token - Token único de la sesión
   * @param {string} options.userID - ID del usuario
   * @param {Set<string>} options.permissions - Permisos del usuario
   * @param {Set<string>} options.roles - Roles del usuario
   * @param {Object} options.data - Datos adicionales del usuario
   * @param {string} options.ip - Dirección IP del cliente
   * @param {string} options.userAgent - User agent del navegador
   * @param {string} options.referer - URL de referencia
   * @param {Date} options.createdAt - Fecha de creación
   * @param {Date} options.updatedAt - Fecha de última actualización
   * @param {Date} options.expiresAt - Fecha de expiración
   */
  constructor({
    token = newToken(),
    userID = undefined,
    permissions = new Set(),
    roles = new Set(),
    data = {},
    ip = 'unknown',
    userAgent = 'unknown',
    referer = '',
    createdAt = new Date(),
    updatedAt = new Date(),
    expiresAt = new Date(Date.now() + config.sessionLife),
  } = {}) {
    this.token = token
    this.userID = userID
    this.permissions = permissions
    this.roles = roles
    this.data = data
    this.ip = ip
    this.userAgent = userAgent
    this.referer = referer
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.expiresAt = expiresAt
  }

  /**
   * Inicia una nueva sesión para un usuario
   * @param {Request} req - La solicitud HTTP
   * @param {Bun.Server} server - El servidor de Bun
   * @param {Object} user - Los datos del usuario
   * @param {Set<string>} roles - Roles del usuario
   * @param {Set<string>} permissions - Permisos del usuario
   * @returns {Promise<Session>} La sesión creada
   */
  static async start(req, server, user = {}, roles = new Set(), permissions = new Set()) {
    const { password, ...data } = user || {}

    const ip =
      server.requestIP(req)?.address ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-client-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    const session = new Session({
      token: newToken(),
      userID: user?._id?.toString() || undefined,
      permissions: permissions,
      roles: roles,
      data: data,
      ip: ip,
      userAgent: req.headers.get('user-agent') || 'unknown',
      referer: req.headers.get('referer') || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + config.sessionLife),
    })

    await session.persist()
    return session
  }

  /**
   * Guarda la sesión en el sistema de archivos
   * @private
   * @returns {Promise<void>}
   */
  async persist() {
    await this.persistToken()
    await this.persistUser()
  }

  /**
   * Guarda el token de sesión en un archivo
   * @private
   * @returns {Promise<void>}
   */
  async persistToken() {
    const encoded = encode(this)
    const filePath = Session.tokenFilePath(this.token)
    try {
      await Bun.write(filePath, encoded)
    } catch (e) {
      throw HttpError.internal(e, 'No pudimos crear tu sesión')
    }
  }

  /**
   * Registra el token en el índice del usuario
   * @private
   * @returns {Promise<void>}
   */
  async persistUser() {
    if (this.userID) {
      const tokens = await Session.getTokensByUserID(this.userID)
      if (!tokens.includes(this.token)) {
        tokens.push(this.token)
      }
      const filePath = Session.userFilePath(this.userID)
      const encoded = encode(tokens)
      try {
        await Bun.write(filePath, encoded)
      } catch (e) {
        throw HttpError.internal(e, 'No pudimos crear tu sesión ' + this.token)
      }
    }
  }

  /**
   * Destruye esta sesión específica
   * @returns {Promise<void>}
   */
  async destroy() {
    Session.destroyByToken(this.token)
    Session.removeTokenOfUser(this.userID ?? '', this.token)
  }

  /**
   * Destruye todas las sesiones del usuario
   * @returns {Promise<void>}
   */
  async destroyAll() {
    if (this.userID) {
      Session.destroyAllByUserID(this.userID)
    } else {
      Session.destroyByToken(this.token)
    }
  }

  /**
   * Destruye todas las sesiones de un usuario por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise<void>}
   */
  static async destroyAllByUserID(id) {
    const tokens = await Session.getTokensByUserID(id)
    for (const token of tokens) {
      await Session.destroyByToken(token)
    }
    const filePath = Session.userFilePath(id)
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
  static async destroyByToken(id) {
    const filePath = Session.tokenFilePath(id)
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
  static async removeTokenOfUser(id, token) {
    const tokens = await Session.getTokensByUserID(id)
    const index = tokens.indexOf(token)
    if (index > -1) {
      tokens.splice(index, 1)
      const filePath = Session.userFilePath(id)
      const encoded = encode(tokens)
      try {
        await Bun.write(filePath, encoded)
      } catch (e) {
        throw HttpError.internal(e, `Hubo un problema al cerrar la sesión`)
      }
    }
  }

  /**
   * Actualiza la fecha de expiración de la sesión
   * @returns {Promise<void>}
   */
  async refresh() {
    this.updatedAt = new Date()
    this.expiresAt = new Date(Date.now() + config.sessionLife)
    await this.persist()
  }

  /**
   * Obtiene una sesión por su token
   * @param {string} id - Token de la sesión
   * @returns {Promise<Session>} La sesión encontrada
   */
  static async getByToken(id) {
    const filePath = this.tokenFilePath(id)

    try {
      const file = Bun.file(filePath)

      if (!(await file.exists())) {
        throw HttpError.unauthorized('Tu sesión ha expirado, por favor inicia sesión nuevamente')
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
        throw HttpError.unauthorized('Tu sesión ha expirado, por favor inicia sesión nuevamente')
      }

      session.refresh()
      return session
    } catch (e) {
      if (e instanceof HttpError) {
        throw e
      }

      if (e?.code === 'ENOENT') {
        throw HttpError.unauthorized('Tu sesión ha expirado, por favor inicia sesión nuevamente')
      }

      throw HttpError.internal(e, 'Hubo un problema al recuperar tu sesión')
    }
  }

  /**
   * Obtiene todos los tokens de sesión de un usuario
   * @private
   * @param {string} id - ID del usuario
   * @returns {Promise<string[]>} Array de tokens
   */
  static async getTokensByUserID(id) {
    const filePath = Session.userFilePath(id)
    try {
      const file = Bun.file(filePath)
      if (!(await file.exists())) {
        return []
      }
      const buffer = await file.bytes()
      const decoded = decode(buffer)
      return decoded
    } catch (e) {
      throw HttpError.internal(e, 'No pudimos obtener tus sesiones')
    }
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<Session[]>} Array de sesiones
   */
  static async getByUserID(id) {
    const tokens = await Session.getTokensByUserID(id)
    const sessions = []
    for (const token of tokens) {
      const session = await Session.getByToken(token)
      sessions.push(session)
    }
    return sessions
  }

  /**
   * Genera la ruta del archivo para un token
   * @private
   * @param {string} tk - Token de la sesión
   * @returns {string} Ruta del archivo
   */
  static tokenFilePath(tk) {
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
  static userFilePath(id) {
    const dir = id.slice(0, 3)
    const fileName = id.slice(3)
    return `tmp/sessions/index/${dir}/${fileName}`
  }

  /**
   * verifica si la session posee el permiso
   * @param {string} permission
   * @returns {boolean}
   */
  can(permission) {
    return this.permissions.has(permission)
  }

  /**
   * verifica si la session posee el rol
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    return this.roles.has(role)
  }

  /**
   * verifica si la session posee los permisos
   * @param {string[]} permissions
   * @returns {boolean}
   */
  hasPermissions(permissions) {
    for (const permission of permissions) {
      if (this.permissions.has(permission)) {
        return true
      }
    }
    return false
  }
}
