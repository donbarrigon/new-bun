import { env } from './env.js'
import { view } from '../app/utils/view/view.js'
import { route } from '../app/utils/router/router.js'
import { HttpError } from '../app/utils/errors/HttpError.js'

globalThis.config = env
globalThis.view = view
globalThis.route = route
globalThis.HttpError = HttpError
