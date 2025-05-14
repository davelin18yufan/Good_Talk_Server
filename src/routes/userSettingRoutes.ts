import { Router } from "express"
import { body } from "express-validator"
import { asyncHandler } from "../middlewares/asyncHandler"
import { auth } from "../middlewares/auth"
import {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
  updateDashboardLayout,
} from "../controllers/userSettingsController"

const router = Router()

const validateUserSettings = [
  body("initialCapital")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Initial capital must be a positive number"),
  body("currentCapital")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Current capital must be a positive number"),
  body("leverageRatio")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Leverage ratio must be at least 1"),
  body("commissionRate")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Commission rate must be between 0 and 1"),
  body("dashboardLayout")
    .optional()
    .isObject()
    .withMessage("Dashboard layout must be an object"),
  body("riskTolerance")
    .optional()
    .isString()
    .withMessage("Risk tolerance must be a string"),
  body("avatarUrl")
    .optional()
    .isURL()
    .withMessage("Avatar URL must be a valid URL"),
  body("profileVideoId")
    .optional()
    .isString()
    .withMessage("Profile video ID must be a string"),
  body("bio").optional().isString().trim().withMessage("Bio must be a string"),
  body("location")
    .optional()
    .isString()
    .trim()
    .withMessage("Location must be a string"),
  body("aka").optional().isString().trim().withMessage("AKA must be a string"),
]

const validateDashboardLayout = [
  body("dashboardLayout")
    .isObject()
    .withMessage("Dashboard layout must be an object")
    .custom((value) => {
      const requiredKeys = ["lg", "md", "sm", "xs", "xxs"]
      if (!requiredKeys.every((key) => key in value)) {
        throw new Error(
          "Dashboard layout must include all responsive sizes (lg, md, sm, xs, xxs)"
        )
      }
      return requiredKeys.every(
        (key) =>
          Array.isArray(value[key]) &&
          value[key].every(
            (item: any) =>
              typeof item.w === "number" &&
              typeof item.h === "number" &&
              typeof item.x === "number" &&
              typeof item.y === "number" &&
              typeof item.i === "string" &&
              typeof item.minW === "number" &&
              typeof item.minH === "number" &&
              typeof item.moved === "boolean" &&
              typeof item.static === "boolean" &&
              typeof item.chartId === "string"
          )
      )
    })
    .withMessage("Invalid dashboard layout format"),
  body("toolbox")
    .isObject()
    .withMessage("Toolbox must be an object")
    .custom((value) => {
      const requiredKeys = ["lg", "md", "sm", "xs", "xxs"]
      if (!requiredKeys.every((key) => key in value)) {
        throw new Error(
          "Toolbox must include all responsive sizes (lg, md, sm, xs, xxs)"
        )
      }
      return requiredKeys.every(
        (key) =>
          Array.isArray(value[key]) &&
          value[key].every(
            (item: any) =>
              typeof item.w === "number" &&
              typeof item.h === "number" &&
              typeof item.x === "number" &&
              typeof item.y === "number" &&
              typeof item.i === "string" &&
              typeof item.minW === "number" &&
              typeof item.minH === "number" &&
              typeof item.moved === "boolean" &&
              typeof item.static === "boolean" &&
              typeof item.chartId === "string"
          )
      )
    })
    .withMessage("Invalid toolbox format"),
]

//* Protect all user routes with authentication
router.use(auth)

router.get("/", asyncHandler(getUserSettings))
router.post("/", validateUserSettings, asyncHandler(createUserSettings))
router.put("/", validateUserSettings, asyncHandler(updateUserSettings))
router.patch(
  "/dashboard",
  validateDashboardLayout,
  asyncHandler(updateDashboardLayout)
)

export const userSettingsRoutes = router
