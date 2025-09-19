import { loginPage } from '../../ui/views/user/login'
import { signupPage } from '../../ui/views/user/singup'
export async function userLogin(): Promise<Response> {
  return view(loginPage())
}

export async function userSingup(): Promise<Response> {
  return view(signupPage())
}
