import { Router } from "express"

import { PREFIX_ROUTE } from "../constants/url" // Prefix Global route
import { userRoutes } from "./userRoutes"
import { authRoutes } from "./authRoutes"
import { articleRoutes } from "./articleRoutes"
import { userSettingsRoutes } from "./userSettingRoutes"

//* Routes *//
const router = Router()

router.use("/auth", authRoutes)
router.use(`${PREFIX_ROUTE}/users`, userRoutes)
router.use(`${PREFIX_ROUTE}/users`, userSettingsRoutes)
router.use(`${PREFIX_ROUTE}/articles`, articleRoutes)

export { router }
