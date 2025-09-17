import type { env } from './config/env.ts'
import type { view } from './app/shared/view/view.ts'
import type { AppError } from './app/shared/errors/errors.ts'

declare global {
  var config: typeof env
  var view: typeof view
  var AppError: typeof AppError
}

export {}
