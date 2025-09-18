import { index, publicFiles } from '../app/controllers/home'
import { userLogin, userSingUp } from '../app/controllers/user'

export type ControllerFun = (req: Request) => Response | Promise<Response>
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'
export type RouteHandler = ControllerFun | Partial<Record<HttpMethod, ControllerFun>>

export const appRoutes = (): Record<string, RouteHandler> => {
  return {
    '/': index,
    '/public/*': { GET: publicFiles },
    '/login': {
      GET: userLogin,
      POST: userLogin,
    },
    '/signup': {
      GET: userSingUp,
      POST: userSingUp,
    },
  }
}
