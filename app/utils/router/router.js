import { HttpError } from '../errors/HttpError.js'

// Controlador: función que recibe un Request y devuelve un Response
// typedef Controller = (req: Request) => Promise<Response>

// Middleware: recibe un controlador y devuelve un controlador
// typedef Middleware = (handler: Controller) => Controller

// Métodos HTTP válidos
// typedef HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'

// Mapa de rutas y controladores
// typedef RouteHandler = { [method in HttpMethod]?: Controller }
// typedef RouteMap = Record<string, RouteHandler>

const globalMiddlewares = []
const globalprefixes = []
const routeMap = {}
const routeNameMap = {}

/**
 * Registra una ruta con método GET
 * @param {string} path - Ruta a registrar
 * @param {Function} controller - Controlador de la ruta
 * @param {string} [name=''] - Nombre de la ruta (opcional)
 * @returns {void}
 */
export const get = (path, controller, name = '') => addRoute('GET', path, controller, name)

/**
 * Registra una ruta con método POST
 */
export const post = (path, controller, name = '') => addRoute('POST', path, controller, name)

/**
 * Registra una ruta con método PUT
 */
export const put = (path, controller, name = '') => addRoute('PUT', path, controller, name)

/**
 * Registra una ruta con método PATCH
 */
export const patch = (path, controller, name = '') => addRoute('PATCH', path, controller, name)

/**
 * Registra una ruta con método DELETE
 */
export const del = (path, controller, name = '') => addRoute('DELETE', path, controller, name)

/**
 * Registra una ruta con método HEAD
 */
export const head = (path, controller, name = '') => addRoute('HEAD', path, controller, name)

/**
 * Registra una ruta con método OPTIONS
 */
export const options = (path, controller, name = '') => addRoute('OPTIONS', path, controller, name)

/**
 * Registra una ruta con método CONNECT
 */
export const connect = (path, controller, name = '') => addRoute('CONNECT', path, controller, name)

/**
 * Registra una ruta con método TRACE
 */
export const trace = (path, controller, name = '') => addRoute('TRACE', path, controller, name)

/**
 * Agrupa rutas con un prefijo y middlewares globales
 * @param {string} prefix - Prefijo común para las rutas
 * @param {Function[]} middlewares - Lista de middlewares
 * @param {Function} callback - Función donde se definen las rutas
 * @returns {void}
 */
export function group(prefix, middlewares, callback) {
  const prefixes = prefix.trim().split('/').filter(Boolean)
  globalprefixes.push(...prefixes)
  globalMiddlewares.push(...middlewares)
  callback()
  prefixes.forEach(() => globalprefixes.pop())
  middlewares.forEach(() => globalMiddlewares.pop())
}

/**
 * Aplica un prefijo temporal a las rutas dentro del callback
 * @param {string} prefix - Prefijo a aplicar
 * @param {Function} callback - Función donde se definen rutas
 * @returns {void}
 */
export function prefix(prefix, callback) {
  const prefixes = prefix.trim().split('/').filter(Boolean)
  globalprefixes.push(...prefixes)
  callback()
  prefixes.forEach(() => globalprefixes.pop())
}

/**
 * Aplica middlewares temporales a las rutas dentro del callback
 * @param {Function[]} middlewares - Lista de middlewares
 * @param {Function} callback - Función donde se definen rutas
 * @returns {void}
 */
export function middleware(middlewares, callback) {
  globalMiddlewares.push(...middlewares)
  callback()
  middlewares.forEach(() => globalMiddlewares.pop())
}

/**
 * Aplica una lista de middlewares a un controlador
 * @param {Function} handler - Controlador base
 * @param {Function[]} middlewares - Lista de middlewares
 * @returns {Function} Nuevo controlador con los middlewares aplicados
 */
export function use(handler, middlewares) {
  return middlewares.reduceRight((next, mw) => mw(next), handler)
}

/**
 * Obtiene el mapa completo de rutas
 * @returns {Object} routeMap con todas las rutas registradas
 */
export function getRouteMap() {
  return routeMap
}

/**
 * Agrega una ruta al mapa de rutas
 * @param {string} method - Método HTTP
 * @param {string} path - Ruta a registrar
 * @param {Function} handler - Controlador de la ruta
 * @param {string} [name=''] - Nombre de la ruta (opcional)
 * @returns {void}
 */
function addRoute(method, path, handler, name = '') {
  const p = [...globalprefixes, ...path.trim().split('/').filter(Boolean)]
  const key = '/' + p.join('/')
  setName(method, key, name)
  if (!routeMap[key]) {
    routeMap[key] = {}
  }
  routeMap[key][method] = use(handler, globalMiddlewares)
}

/**
 * Asigna un nombre a una ruta
 * @param {string} method - Método HTTP
 * @param {string} path - Ruta
 * @param {string} name - Nombre de la ruta
 * @returns {void}
 */
function setName(method, path, name) {
  if (name !== '') {
    const n = [...globalprefixes, ...name.trim().split('.').filter(Boolean)]
    const key = n.join('.')
    routeNameMap[key] = { method, path }
  }
}

/**
 * Devuelve la ruta registrada por nombre (solo para GET)
 * @param {string} name - Nombre de la ruta
 * @returns {string} Ruta asociada
 * @throws {HttpError} Si no existe la ruta o no es GET
 */
export function route(name) {
  const r = routeNameMap[name]
  if (!r || r.method !== 'GET') {
    throw HttpError.internal('La ruta GET: "' + name + '" no existe')
  }
  return r.path
}

/**
 * Devuelve la información de una ruta por nombre
 * @param {string} name - Nombre de la ruta
 * @returns {{ method: string, path: string } | undefined} Objeto con método y ruta
 */
export function routeInfo(name) {
  return routeNameMap[name]
}
