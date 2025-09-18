import { HttpError } from '../shared/errors/HttpErrors'
export function handlerError(handler: (req: Request) => Promise<Response>) {
  return async function (req: Request): Promise<Response> {
    try {
      return await handler(req)
    } catch (e) {
      return HttpError.response(e)
    }
  }
}
