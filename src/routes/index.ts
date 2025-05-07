import { Router } from "express"

import { PREFIX_ROUTE } from "../constants/url" // Prefix Global route
import { userRoutes } from "./userRoutes"
import { authRoutes } from "./authRoutes"
import { articleRoutes } from "./articleRoutes"
import { userSettingsRoutes } from "./userSettingRoutes"
import { tagRoutes } from "./tagRoutes"
import { performanceRoutes } from "./performanceRoutes"
import { transactionRoutes } from "./transactionRoutes"

//* Routes *//
const router = Router()

router.use("/auth", authRoutes)
router.use(`${PREFIX_ROUTE}/users`, userRoutes)
router.use(`${PREFIX_ROUTE}/userSettings`, userSettingsRoutes)
router.use(`${PREFIX_ROUTE}/articles`, articleRoutes)
router.use(`${PREFIX_ROUTE}/tags`, tagRoutes)
router.use(`${PREFIX_ROUTE}/performance`, performanceRoutes)
router.use(`${PREFIX_ROUTE}/transactions`, transactionRoutes)

export { router }
