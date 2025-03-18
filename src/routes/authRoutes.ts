import { Router } from "express"
import { body } from "express-validator"
import { asyncHandler } from "../middlewares/asyncHandler"
import {
  login,
  register,
  requestReset,
  resetPassword,
} from "../controllers/authController"

const router = Router()

// *Validation
const validateRegistration = [
  body("name").trim().isLength({ min: 2 }).escape(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).isAlphanumeric().escape(),
]

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
]

const validateForgotPassword = [body("email").isEmail().normalizeEmail()]

const validateResetPassword = [
  body("email").isEmail().normalizeEmail(),
  body("newPassword")
    .isLength({ min: 8 })
    .isAlphanumeric()
    .withMessage("must contain at least 1 number")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage("must contain both upper and lowercase letters")
    .escape(),
  body("confirmPassword").custom(
    (value, { req }) => value === req.body.newPassword
  ), // confirm password
]

router.post("/register", validateRegistration, asyncHandler(register))
router.post("/login", validateLogin, asyncHandler(login))
router.post(
  "/forgot-password",
  validateForgotPassword,
  asyncHandler(requestReset)
)
router.post(
  "/reset-password",
  validateResetPassword,
  asyncHandler(resetPassword)
)

export const authRoutes = router
