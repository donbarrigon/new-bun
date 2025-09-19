import { env } from './env'
import { view } from '../app/shared/view/view.ts'
import { HttpError } from '../app/shared/errors/HttpErrors.ts'
import { route } from '../routes/routes.ts'

// ⚡ Aquí se asignan los valores reales a globalThis
export function initGlobals() {
  ;(globalThis as any).config = env
  ;(globalThis as any).view = view
  ;(globalThis as any).route = route
  ;(globalThis as any).HttpError = HttpError
}
