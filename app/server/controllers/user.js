import { userCreateRepository } from '../repositories/user'
import { loginPage } from '../../ui/views/user/login'
import { signupPage } from '../../ui/views/user/singup'
import { userStoreValidator } from '../validators/user/store'
export async function userLogin() {
  return view(loginPage())
}

export async function userSingup() {
  return view(signupPage())
}

export async function userStore(req) {
  const user = await userStoreValidator(req)
  await userCreateRepository(user)
  return Response.json(user, { status: 201 })
}
