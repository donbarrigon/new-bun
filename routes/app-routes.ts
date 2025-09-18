import type { RouteMap } from '../app/types/route-map.ts'
import { handlerError } from '../app/middleware/handler-error.ts'
import { index, publicFiles } from '../app/controllers/web/home.ts'
import { userLogin, userCreate } from '../app/controllers/web/user.ts'

export const appRoutes = (): RouteMap => {
  return {
    '/': handlerError(index),
    '/public/*': { GET: publicFiles },
    '/login': {
      GET: handlerError(userLogin),
      POST: handlerError(userLogin),
    },
    '/signup': {
      GET: handlerError(userCreate),
      POST: handlerError(userCreate),
    },
  }
}
