import { index, publicFiles } from '../controllers/home'
import { catchErrors } from '../middleware/catch-errors'
import { get, getRouteMap, type RouteMap, middleware } from '../../utils/router/router'
import { userRoutes } from './user'

export const appRoutes = (): RouteMap => {
  middleware([catchErrors], () => {
    get('/', index, 'home')
    get('/public/*', publicFiles)

    userRoutes()
  })

  return getRouteMap()
}
