import type { env } from './config/env'
import type { render } from './utils/render'
import type { AppError } from './utils/errors'

declare global {
  var config: typeof env
  var render: typeof render
  var AppError: typeof AppError
}

export {}
