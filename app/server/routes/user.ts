import { get, post, prefix } from "../../utils/router"
import { userLogin, userSingup, userStore } from "../controllers/user"

export function userRoutes() {
  get("/user/login", userLogin, "user.login")
  get("/user/signup", userSingup, "user.signup")

  prefix("/api", () => {
    post("/user/login", userLogin, "api.user.login") // sin hacer
    post("/user/store", userStore, "api.user.store")
  })
}
