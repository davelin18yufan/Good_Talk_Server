import express from "express"
import { asyncHandler } from "../middlewares"
import { getPerformance } from "@/controllers/performanceController"

const router = express.Router()

// Route to get performance data for a user
router.get("/:userId", asyncHandler(getPerformance))

export const performanceRoutes = router
