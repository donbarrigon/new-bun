import { env } from './env'
import { view } from '../app/utils/view/view.ts'
import { route } from '../routes/routes.ts'
import { HttpError } from '../app/utils/errors/HttpError.ts'

// ⚡ Aquí se asignan los valores reales a globalThis
;(globalThis as any).config = env
;(globalThis as any).view = view
;(globalThis as any).route = route
;(globalThis as any).HttpError = HttpError
