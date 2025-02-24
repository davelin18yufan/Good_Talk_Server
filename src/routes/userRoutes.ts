import { Router } from "express"
import { body, param } from "express-validator"
import { validate as uuidValidate } from "uuid"

import { asyncHandler, auth } from "../middlewares"
import { getAllUsers, getUserById } from "../controllers/userController"

const router = Router()

// *Validate user input
const validateUser = [
  body("name").trim().isLength({ min: 2 }).escape(),
  body("email").isEmail().normalizeEmail(),
]

// *Validate uuid for request
const validateUUID = [
  param("id").custom((value) => {
    if(!uuidValidate(value)) {
      throw new Error("Invalid UUID")
    }
    return true
  })
]

// Protect all user routes with authentication
router.use(auth)

router.get("/", asyncHandler(getAllUsers))
router.get("/:id", validateUUID, asyncHandler(getUserById))
// router.post("/", validateUser, asyncHandler(createUser))
// router.put("/:id", [...validateUUID, ...validateUser], asyncHandler(updateUser))
// router.delete("/:id", validateUUID, asyncHandler(deleteUser))

export const userRoutes = router
