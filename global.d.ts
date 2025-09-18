import type { env } from './config/env.ts'
import type { view } from './app/shared/view/view.ts'
import type { HttpError } from './app/shared/errors/HttpErrors.ts'

declare global {
  var config: typeof env
  var view: typeof view
  var AppError: typeof AppError
}

export {}
