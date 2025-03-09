import { Router } from "express"
import { body } from "express-validator"
import { asyncHandler } from "../middlewares/asyncHandler"
import { auth } from "../middlewares/auth"
import {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
} from "../controllers/userSettingsController"

const router = Router()

const validateUserSettings = [
  body("initialCapital").optional().isFloat({ min: 0 }).withMessage("Initial capital must be a positive number"),
  body("currentCapital").optional().isFloat({ min: 0 }).withMessage("Current capital must be a positive number"),
  body("leverageRatio").optional().isFloat({ min: 1 }).withMessage("Leverage ratio must be at least 1"),
  body("commissionRate").optional().isFloat({ min: 0, max: 1 }).withMessage("Commission rate must be between 0 and 1"),
  body("dashboardLayout").optional().isObject().withMessage("Dashboard layout must be an object"),
  body("riskTolerance").optional().isString().withMessage("Risk tolerance must be a string"),
  body("avatarUrl").optional().isURL().withMessage("Avatar URL must be a valid URL"),
  body("profileVideoId").optional().isString().withMessage("Profile video ID must be a string"),
  body("bio").optional().isString().trim().withMessage("Bio must be a string"),
  body("location").optional().isString().trim().withMessage("Location must be a string"),
  body("aka").optional().isString().trim().withMessage("AKA must be a string"),
]

//* Protect all user routes with authentication
router.use(auth)

router.get("/", asyncHandler(getUserSettings))
router.post("/", validateUserSettings, asyncHandler(createUserSettings))
router.put("/", validateUserSettings, asyncHandler(updateUserSettings))

export const userSettingsRoutes = router
