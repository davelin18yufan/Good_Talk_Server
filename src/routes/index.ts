import { Router } from "express"

import { PREFIX_ROUTE } from "../constants/url" // Prefix Global route
import { userRoutes } from "./userRoutes"

//* Routes *//
const routes = Router()

routes.use(`${PREFIX_ROUTE}/users`, userRoutes)
// routes.use(`${PREFIX_ROUTE}/posts`, postRoutes)

export { routes }
