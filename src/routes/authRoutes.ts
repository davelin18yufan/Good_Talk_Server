import { Router } from "express"
import { body } from "express-validator"
import { asyncHandler } from "../middlewares/asyncHandler"
import { login, register } from "../controllers/authController"

const router = Router()

// *Validation
const validateRegistration = [
  body("name").trim().isLength({ min: 2 }).escape(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
]

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
]

router.post("/register", validateRegistration, asyncHandler(register))
router.post("/login", validateLogin, asyncHandler(login))

export const authRoutes = router
