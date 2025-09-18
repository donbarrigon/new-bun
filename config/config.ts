import { env } from './env'
import { view } from '../app/shared/view/view.ts'
import { HttpError } from '../app/shared/errors/HttpErrors.ts'

export default () => {
  globalThis.config = env
  globalThis.view = view
  globalThis.AppError = HttpError
}
