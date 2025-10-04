import { encode } from "@msgpack/msgpack"
import { newToken } from "./token.js"

/**
 * Clase para manejar sesiones de usuario
 */
/**
 * @typedef {Object} SessionInit
 * @property {string} [token] - Token único de la sesión
 * @property {string} [userID] - ID del usuario
 * @property {Set<string>} [permissions] - Permisos del usuario
 * @property {Set<string>} [roles] - Roles del usuario
 * @property {Object} [data] - Datos adicionales del usuario
 * @property {string} [ip] - Dirección IP del cliente
 * @property {string} [userAgent] - User agent del navegador
 * @property {string} [referer] - URL de referencia
 * @property {Date} [createdAt] - Fecha de creación
 * @property {Date} [updatedAt] - Fecha de última actualización
 * @property {Date} [expiresAt] - Fecha de expiración
 */

export class Session {
  /**
   * Crea una nueva instancia de sesión
   * @param {SessionInit} [init] - Configuración inicial de la sesión
   */
  constructor(init = {}) {
    this.token = init.token ?? newToken()
    this.userID = init.userID
    this.permissions = init.permissions ?? new Set()
    this.roles = init.roles ?? new Set()
    this.data = init.data ?? {}
    this.ip = init.ip ?? "unknown"
    this.userAgent = init.userAgent ?? "unknown"
    this.referer = init.referer ?? ""
    this.createdAt = init.createdAt ?? new Date()
    this.updatedAt = init.updatedAt ?? new Date()
    this.expiresAt = init.expiresAt ?? new Date(Date.now() + config.sessionLife)
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
    const filePath = tokenFilePath(this.token)
    try {
      await Bun.write(filePath, encoded)
    } catch (e) {
      throw HttpError.internal(e, "No pudimos crear tu sesión")
    }
  }

  /**
   * Registra el token en el índice del usuario
   * @private
   * @returns {Promise<void>}
   */
  async persistUser() {
    if (this.userID) {
      const tokens = await sessionTokensByUserID(this.userID)
      if (!tokens.includes(this.token)) {
        tokens.push(this.token)
      }
      const filePath = userFilePath(this.userID)
      const encoded = encode(tokens)
      try {
        await Bun.write(filePath, encoded)
      } catch (e) {
        throw HttpError.internal(e, `No pudimos crear tu sesión ${this.token}`)
      }
    }
  }

  /**
   * Destruye esta sesión específica
   * @returns {Promise<void>}
   */
  async destroy() {
    await sessionDestroyByToken(this.token)
    await sessionRemoveTokenOfUser(this.userID ?? "", this.token)
  }

  /**
   * Destruye todas las sesiones del usuario
   * @returns {Promise<void>}
   */
  async destroyAll() {
    if (this.userID) {
      await sessionDestroyAllByUserID(this.userID)
    } else {
      await sessionDestroyByToken(this.token)
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
   * Genera la cookie para la sesión
   * @param {boolean} debug - Si está en modo debug (omite `Secure`)
   * @returns {string} - String para usar en el header `Set-Cookie`
   */
  cookie() {
    if (config.appDebug) {
      return `session=${this.token}; HttpOnly; Path=/; Expires=${this.expiresAt.toUTCString()}; SameSite=Strict`
    }
    return `session=${this.token}; HttpOnly; Secure; Path=/; Expires=${this.expiresAt.toUTCString()}; SameSite=Strict`
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
