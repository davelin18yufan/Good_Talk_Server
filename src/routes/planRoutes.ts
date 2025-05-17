import { Router } from "express"
import { body, param } from "express-validator"
import { validate as uuidValidate } from "uuid"
import { asyncHandler, auth } from "../middlewares"
import {
  getUserPlans,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanExecuted,
} from "../controllers/planController"

const router = Router()

// Validate plan input
const validatePlan = [
  body("type").isIn(["多單", "空單"]).withMessage("Invalid tradeType"),
  body("symbol").trim().isLength({ min: 1 }).withMessage("Symbol is required"),
  body("action").isIn(["BUY", "SELL"]).withMessage("Invalid operation"),
  body("entryPrice").isFloat({ min: 0 }).withMessage("Invalid entryPrice"),
  body("targetPrice").isFloat({ min: 0 }).withMessage("Invalid targetPrice"),
  body("stopType").isIn(["停損", "停利"]).withMessage("Invalid stopType"),
  body("stopPrice").isFloat({ min: 0 }).withMessage("Invalid stopPrice"),
  body("expectation").isFloat({ min: 0 }).withMessage("Invalid expectation"),
  body("comment").optional().trim().escape(),
]

// Validate UUIDs
const validateUUID = [
  param("userId").custom((value) => {
    if (!uuidValidate(value)) {
      throw new Error("Invalid userId UUID")
    }
    return true
  }),
]

const validatePlanUUID = [
  param("planId").custom((value) => {
    if (!uuidValidate(value)) {
      throw new Error("Invalid planId UUID")
    }
    return true
  }),
]

// Protect all plan routes with authentication
router.use(auth)

router.get("/:userId", validateUUID, asyncHandler(getUserPlans))
router.post(
  "/:userId",
  [...validateUUID, ...validatePlan],
  asyncHandler(createPlan)
)
router.put(
  "/:userId/:planId",
  [...validateUUID, ...validatePlanUUID, ...validatePlan],
  asyncHandler(updatePlan)
)
router.delete(
  "/:userId/:planId",
  [...validateUUID, ...validatePlanUUID],
  asyncHandler(deletePlan)
)
router.patch(
  "/:userId/:planId/execute",
  [...validateUUID, ...validatePlanUUID],
  asyncHandler(togglePlanExecuted)
)

export const planRoutes = router
