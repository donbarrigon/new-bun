import { BSON } from 'mongodb'
import { newToken } from './token'
import { encode, decode } from '@msgpack/msgpack'

export class Session {
  public token: string
  public userID: BSON.ObjectId | undefined
  public permissions: Set<string>
  public roles: Set<string>
  public data: any
  public ip: string
  public userAgent: string
  public referer: string

  public readonly createdAt: Date
  public updatedAt: Date
  public expiresAt: Date

  public constructor() {
    this.token = newToken()
    this.userID = undefined
    this.permissions = new Set()
    this.roles = new Set()
    this.data = {}
    this.ip = 'unknown'
    this.userAgent = 'unknown'
    this.referer = ''
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.expiresAt = new Date(Date.now() + config.sessionLife)
  }

  public async start(req: Request, server: Bun.Server, user: Record<string, any>) {
    this.userID = user?._id

    this.roles = new Set(user?.roles || [])
    this.permissions = new Set(user?.permissions || [])

    const { roles, permissions, password, _id, ...userData } = user || {}
    this.data = userData

    this.ip =
      server.requestIP(req)?.address ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-client-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    this.userAgent = req.headers.get('user-agent') || 'unknown'
    this.referer = req.headers.get('referer') || ''

    this.updatedAt = new Date()
    this.expiresAt = new Date(Date.now() + config.sessionLife)

    await this.persist()
  }

  private async persist() {
    const encoded = encode(this)

    const dir = this.token.slice(0, 3)
    const fileName = this.token.slice(3) + '.mpk'
    const filePath = `tmp/sessions/${dir}/${fileName}`

    try {
      await Bun.write(filePath, encoded)
    } catch (e) {
      if (e instanceof Error) {
        ;(e as any)._message = e.message
        e.message = 'Error al persistir la sesión'
      }
      throw HttpError.internal(e)
    }
  }

  public async destroy() {
    const dir = this.token.slice(0, 3)
    const fileName = this.token.slice(3) + '.mpk'
    const filePath = `tmp/sessions/${dir}/${fileName}`

    try {
      await Bun.file(filePath).unlink()
    } catch (e) {
      if (e instanceof Error) {
        ;(e as any)._message = e.message
        e.message = 'Error al cerrar la sesión'
      }
      throw HttpError.internal(e)
    }
  }

  public async refresh() {
    this.updatedAt = new Date()
    this.expiresAt = new Date(Date.now() + config.sessionLife)
    await this.persist()
  }

  public static async get(id: string): Promise<Session> {
    const dir = id.slice(0, 3)
    const fileName = id.slice(3) + '.mpk'
    const filePath = `tmp/sessions/${dir}/${fileName}`

    try {
      const file = Bun.file(filePath)

      if (!(await file.exists())) {
        throw HttpError.unauthorized('Sesión expirada')
      }

      const buffer = await file.arrayBuffer()
      const decoded = decode(new Uint8Array(buffer)) as any

      // Reconstruir la sesión
      const session = Object.create(Session.prototype)
      Object.assign(session, decoded)

      // Convertir fechas de string a Date
      session.createdAt = new Date(decoded.createdAt)
      session.updatedAt = new Date(decoded.updatedAt)
      session.expiresAt = new Date(decoded.expiresAt)

      // Reconstruir Sets
      session.roles = new Set(decoded.roles)
      session.permissions = new Set(decoded.permissions)

      // Verificar si la sesión expiró
      if (session.expiresAt < new Date()) {
        await Bun.file(filePath).unlink()
        throw HttpError.unauthorized('Sesión expirada')
      }

      return session
    } catch (e) {
      if (e instanceof HttpError) {
        throw e
      }

      // Si el archivo no existe, retornar null
      if ((e as any)?.code === 'ENOENT') {
        throw HttpError.unauthorized('Sesión expirada')
      }

      if (e instanceof Error) {
        ;(e as any)._message = e.message
        e.message = 'Error al obtener la sesión'
      }
      throw HttpError.internal(e)
    }
  }
}
