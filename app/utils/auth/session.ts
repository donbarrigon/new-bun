import { BSON } from 'mongodb'
import { newToken } from './token'
import { encode, decode } from '@msgpack/msgpack'

export type SessionInit = {
  token: string
  userID: BSON.ObjectId | string | number | undefined
  permissions: Set<string>
  roles: Set<string>
  data: any
  ip: string
  userAgent: string
  referer: string
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

export class Session {
  public readonly token: string
  public readonly userID: BSON.ObjectId | string | number | undefined
  public permissions: Set<string>
  public roles: Set<string>
  public data: any
  public ip: string
  public userAgent: string
  public referer: string

  public readonly createdAt: Date
  public updatedAt: Date
  public expiresAt: Date

  public constructor({
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
  }: Partial<SessionInit> = {}) {
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

  public static async start(
    req: Request,
    server: Bun.Server,
    user: Record<string, any> = {},
    roles: Set<string> = new Set<string>(),
    permissions: Set<string> = new Set<string>()
  ): Promise<Session> {
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
      userID: user?._id,
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

  private async persist() {
    const encoded = encode(this)

    const dir = this.token.slice(0, 3)
    const fileName = this.token.slice(3) + '.mpk'
    const filePath = `tmp/sessions/${dir}/${fileName}`

    try {
      await Bun.write(filePath, encoded)
    } catch (e) {
      throw HttpError.internal(e, 'Error al persistir la sesión')
    }
  }

  public async destroy() {
    const dir = this.token.slice(0, 3)
    const fileName = this.token.slice(3) + '.mpk'
    const filePath = `tmp/sessions/${dir}/${fileName}`

    try {
      await Bun.file(filePath).unlink()
    } catch (e) {
      throw HttpError.internal(e, 'Error al cerrar la sesión')
    }
  }

  public async refresh() {
    this.updatedAt = new Date()
    this.expiresAt = new Date(Date.now() + config.sessionLife)
    await this.persist()
  }

  public static async getById(id: string): Promise<Session> {
    const dir = id.slice(0, 3)
    const fileName = id.slice(3) + '.mpk'
    const filePath = `tmp/sessions/${dir}/${fileName}`

    try {
      const file = Bun.file(filePath)

      if (!(await file.exists())) {
        throw HttpError.unauthorized('Sesión expirada')
      }

      const buffer = await file.bytes()
      const decoded = decode(buffer) as any

      decoded.createdAt = new Date(decoded.createdAt)
      decoded.updatedAt = new Date(decoded.updatedAt)
      decoded.expiresAt = new Date(decoded.expiresAt)

      decoded.roles = new Set(decoded.roles)
      decoded.permissions = new Set(decoded.permissions)

      const session = new Session(decoded)

      if (session.expiresAt < new Date()) {
        await Bun.file(filePath).unlink()
        throw HttpError.unauthorized('Sesión expirada')
      }

      session.refresh()
      return session
    } catch (e) {
      if (e instanceof HttpError) {
        throw e
      }

      // Si el archivo no existe, retornar null
      if ((e as any)?.code === 'ENOENT') {
        throw HttpError.unauthorized('Sesión expirada')
      }

      throw HttpError.internal(e, 'Error al obtener la sesión')
    }
  }
}
