import type { env } from './config/env'
import type { view as viewFunc } from './app/utils/view/view'
import type { route as routeFunc } from './routes/routes'
import type { HttpError as HttpErrorClass } from './app/utils/errors/HttpError'

declare global {
  /** Configuración global de la app */
  const config: typeof env

  /** Motor de vistas */
  const view: typeof viewFunc

  /** Helper para generar URLs de rutas GET */
  const route: typeof routeFunc

  /** Clase base para errores HTTP */
  const HttpError: typeof HttpErrorClass
}

export {}
