import { userCreateRepository } from '../repositories/user'
import { loginPage } from '../../ui/views/user/login'
import { signupPage } from '../../ui/views/user/singup'
import { userStoreValidator } from '../validators/user/store'
export async function userLogin(): Promise<Response> {
  return view(loginPage())
}

export async function userSingup(): Promise<Response> {
  return view(signupPage())
}

export async function userStore(req: Request): Promise<Response> {
  const user = await userStoreValidator(req)
  await userCreateRepository(user)
  return Response.json(user, { status: 201 })
}
