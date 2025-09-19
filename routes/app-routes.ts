import { userStore } from '../app/controllers/api/user'
import { index, publicFiles } from '../app/controllers/web/home'
import { userLogin, userSingup } from '../app/controllers/web/user'
import { get, post, getRouteMap, type RouteMap } from './routes'

export const appRoutes = (): RouteMap => {
  get('/', index, 'home')
  get('/public/*', publicFiles)
  get('/user/login', userLogin, 'user.login')
  post('/api/user/login', userLogin, 'api.user.login') // sin hacer
  get('/user/signup', userSingup, 'user.signup')
  post('/api/user/store', userStore, 'api.user.store')
  return getRouteMap()
}
