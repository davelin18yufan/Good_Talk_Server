import { Router } from "express"
import { body } from "express-validator"
import { asyncHandler } from "../middlewares/asyncHandler"
import {
  login,
  register,
  requestReset,
  resetPassword,
  verifyEmail,
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

const validateEmailOnly = [body("email").isEmail().normalizeEmail()]

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

const validateEmailVerification = [
  body("email").isEmail().normalizeEmail(),
  body("token").exists(),
]

router.post("/register", validateRegistration, asyncHandler(register))
router.post("/login", validateLogin, asyncHandler(login))
router.post(
  "/verify-email",
  validateEmailVerification,
  asyncHandler(verifyEmail)
)
router.post(
  "/resend-verification",
  validateEmailOnly,
  asyncHandler(verifyEmail)
)
router.post("/forgot-password", validateEmailOnly, asyncHandler(requestReset))
router.post(
  "/reset-password",
  validateResetPassword,
  asyncHandler(resetPassword)
)

export const authRoutes = router
