import type { Controller } from '../utils/routes/routes'

export function catchErrors(handler: Controller): Controller {
  return async function (req: Request): Promise<Response> {
    try {
      return await handler(req)
    } catch (e) {
      return HttpError.response(e)
    }
  }
}
