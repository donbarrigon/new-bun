import { index, publicFiles } from '../app/controllers/home'
import { catchErrors } from '../app/middleware/catch-errors'
import { get, getRouteMap, type RouteMap, middleware } from '../app/utils/routes/routes'
import { userRoutes } from './user'

export const appRoutes = (): RouteMap => {
  middleware([catchErrors], () => {
    get('/', index, 'home')
    get('/public/*', publicFiles)

    userRoutes()
  })

  return getRouteMap()
}
