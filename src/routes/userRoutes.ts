import { Router } from "express"
import { body } from "express-validator"

import { asyncHandler } from "../middlewares/asyncHandler"
import {
  getAllUsers,
  getUserById,
} from "../controllers/userController"

const router = Router()

const validateUser = [
  body("name").trim().isLength({ min: 2 }).escape(),
  body("email").isEmail().normalizeEmail(),
]

router.get("/", asyncHandler(getAllUsers))
router.get("/:id", asyncHandler(getUserById))
// router.post("/", validateUser, asyncHandler(createUser))
// router.put("/:id", validateUser, asyncHandler(updateUser))
// router.delete("/:id", asyncHandler(deleteUser))

export const userRoutes = router
