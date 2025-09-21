import { HttpError } from '../errors/HttpError.ts'

export type Controller = (req: Request) => Promise<Response>
export type Middleware = (handler: Controller) => Controller
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'
export type RouteHandler = Partial<Record<HttpMethod, Controller>>
export type RouteMap = Record<string, RouteHandler>

const globalMiddlewares: Middleware[] = []
const globalprefixes: string[] = []
const routeMap: RouteMap = {}
const routeNameMap: Record<string, { method: string; path: string }> = {}

export const get = (path: string, h: Controller, name: string = '') => addRoute('GET', path, h, name)
export const post = (path: string, h: Controller, name: string = '') => addRoute('POST', path, h, name)
export const put = (path: string, h: Controller, name: string = '') => addRoute('PUT', path, h, name)
export const patch = (path: string, h: Controller, name: string = '') => addRoute('PATCH', path, h, name)
export const del = (path: string, h: Controller, name: string = '') => addRoute('DELETE', path, h, name)
export const head = (path: string, h: Controller, name: string = '') => addRoute('HEAD', path, h, name)
export const options = (path: string, h: Controller, name: string = '') => addRoute('OPTIONS', path, h, name)
export const connect = (path: string, h: Controller, name: string = '') => addRoute('CONNECT', path, h, name)
export const trace = (path: string, h: Controller, name: string = '') => addRoute('TRACE', path, h, name)

export function group(prefix: string, middlewares: Middleware[], callback: () => void) {
  const prefixes = prefix.trim().split('/').filter(Boolean)
  globalprefixes.push(...prefixes)
  globalMiddlewares.push(...middlewares)
  callback()
  prefixes.forEach(() => globalprefixes.pop())
  middlewares.forEach(() => globalMiddlewares.pop())
}

export function prefix(prefix: string, callback: () => void) {
  const prefixes = prefix.trim().split('/').filter(Boolean)
  globalprefixes.push(...prefixes)
  callback()
  prefixes.forEach(() => globalprefixes.pop())
}

export function middleware(middlewares: Middleware[], callback: () => void) {
  globalMiddlewares.push(...middlewares)
  callback()
  middlewares.forEach(() => globalMiddlewares.pop())
}

export function use(handler: Controller, middlewares: Middleware[]): Controller {
  return middlewares.reduceRight((next, mw) => mw(next), handler)
}

export function getRouteMap(): RouteMap {
  return routeMap
}

function addRoute(method: HttpMethod, path: string, handler: Controller, name: string = '') {
  const p = [...globalprefixes, ...path.trim().split('/').filter(Boolean)]
  const key = '/' + p.join('/')
  setName(method, key, name)
  if (!routeMap[key]) {
    routeMap[key] = {}
  }
  routeMap[key][method] = use(handler, globalMiddlewares)
}

function setName(method: HttpMethod, path: string, name: string) {
  if (name !== '') {
    const n = [...globalprefixes, ...name.trim().split('.').filter(Boolean)]
    const key = n.join('.')
    routeNameMap[key] = { method, path }
  }
}

export function route(name: string): string {
  const r = routeNameMap[name]
  if (!r || r.method !== 'GET') {
    throw HttpError.internal('La ruta GET: "' + name + '" no existe')
  }
  return r.path
}

export function routeInfo(name: string): { method: string; path: string } | undefined {
  return routeNameMap[name]
}
