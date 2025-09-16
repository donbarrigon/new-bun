import { env } from './env'
import { render } from '../utils/render'
import { AppError } from '../utils/errors'

export default () => {
  globalThis.config = env
  globalThis.render = render
  globalThis.AppError = AppError
}
