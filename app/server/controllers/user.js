import { loginPage } from "../../ui/views/user/login"
import { signupPage } from "../../ui/views/user/singup"
import { userCreateRepository } from "../repositories/user"
import { userStoreValidator } from "../validators/user/store"
export async function userLoginController() {
  return view(loginPage())
}

export async function userSingupController() {
  return view(signupPage())
}

export async function userStoreController(req) {
  const user = await userStoreValidator(req)
  await userCreateRepository(user)
  return Response.json(user, { status: 201 })
}
