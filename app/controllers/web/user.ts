import { loginPage } from '../../ui/views/login'
import { signupPage } from '../../ui/views/singup'
export async function userLogin(): Promise<Response> {
  return view(loginPage())
}

export async function userCreate(): Promise<Response> {
  return view(signupPage())
}
