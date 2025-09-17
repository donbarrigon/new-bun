import { env } from './env'
import { view } from '../app/views/view.ts'
import { AppError } from '../app/errors/errors'

export default () => {
  globalThis.config = env
  globalThis.view = view
  globalThis.AppError = AppError
}
