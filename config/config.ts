import { env } from './env'
import { view } from '../app/shared/view/view.ts'
import { AppError } from '../app/shared/errors/errors.ts'

export default () => {
  globalThis.config = env
  globalThis.view = view
  globalThis.AppError = AppError
}
