import { get, getRouteMap, middleware, type RouteMap } from "../../utils/router"
import { index, publicFiles } from "../controllers/home"
import { catchErrors } from "../middleware/catch-errors"
import { userRoutes } from "./user"

export const appRoutes = (): RouteMap => {
  middleware([catchErrors], () => {
    get("/", index, "home")
    get("/public/*", publicFiles)

    userRoutes()
  })

  return getRouteMap()
}
