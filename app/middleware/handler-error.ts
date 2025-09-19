import type { Controller } from '../../routes/routes'
export function handlerError(handler: Controller): Controller {
  return async function (req: Request): Promise<Response> {
    try {
      return await handler(req)
    } catch (e) {
      return HttpError.response(e)
    }
  }
}
