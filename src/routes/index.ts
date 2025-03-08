import { Router } from "express"

import { PREFIX_ROUTE } from "../constants/url" // Prefix Global route
import { userRoutes } from "./userRoutes"
import { authRoutes } from "./authRoutes"

//* Routes *//
const router = Router()

router.use("/auth", authRoutes)
router.use(`${PREFIX_ROUTE}/users`, userRoutes)
// routes.use(`${PREFIX_ROUTE}/posts`, postRoutes)

export { router }
