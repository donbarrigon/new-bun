import { MongoError } from 'mongodb'
import type { Controller } from '../../utils/router/router'

export function catchErrors(handler: Controller): Controller {
  return async function (req: Request): Promise<Response> {
    try {
      return await handler(req)
    } catch (e) {
      if (e instanceof HttpError) {
        return e.json()
      }
      const instance = typeof e
      if (
        e instanceof MongoError ||
        e?.constructor?.name?.startsWith('Mongo') ||
        e?.constructor?.name?.startsWith('BSON')
      ) {
        return HttpError.mongoError(e).json()
      }
      return HttpError.internal(e).json()
    }
  }
}
