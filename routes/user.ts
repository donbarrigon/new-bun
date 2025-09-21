import { userLogin, userSingup, userStore } from '../app/controllers/user'
import { get, post, prefix } from '../app/utils/routes/routes'

export function userRoutes() {
  get('/user/login', userLogin, 'user.login')
  get('/user/signup', userSingup, 'user.signup')

  prefix('/api', () => {
    post('/user/login', userLogin, 'api.user.login') // sin hacer
    post('/user/store', userStore, 'api.user.store')
  })
}
