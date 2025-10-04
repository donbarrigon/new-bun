import { HttpError } from "../app/utils/errors/HttpError.js"
import { route } from "../app/utils/router/index.js"
import { view } from "../app/utils/view/view.js"
import { env } from "./env.js"

globalThis.config = env
globalThis.view = view
globalThis.route = route
globalThis.HttpError = HttpError
