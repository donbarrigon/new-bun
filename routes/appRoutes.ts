import { index, publicFiles } from '../app/controllers/home.ts'

export type ControllerFun = (req: Request) => Response | Promise<Response>
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'CONNECT'
  | 'TRACE'
export type RouteHandler = ControllerFun | Partial<Record<HttpMethod, ControllerFun>>

export const appRoutes = (): Record<string, RouteHandler> => {
  return {
    '/': index,
    '/public/*': publicFiles,
  }
}
