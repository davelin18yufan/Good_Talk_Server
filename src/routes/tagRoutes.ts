import express from "express"
import { param, body } from "express-validator"
import { validate as uuidValidate } from "uuid"
import { asyncHandler } from "../middlewares"
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagController"

const router = express.Router()

const validateUUID = [
  param("id").custom((value) => {
    if (!uuidValidate(value)) {
      throw new Error("Invalid UUID")
    }
    return true
  }),
]

const validateTag = [
  body("name").notEmpty().withMessage("名稱是必須的"),
  body("categoryId")
    .optional()
    .custom((value) => {
      if (value && !uuidValidate(value)) {
        throw new Error("Invalid categoryId UUID")
      }
      return true
    }),
  body("description")
    .optional()
    .isString()
    .withMessage("內容必須是字串"),
  body("iconUrl")
    .optional()
    .isURL()
    .withMessage("Icon URL must be a valid URL"),
  body("isSystem")
    .optional()
    .isBoolean()
    .withMessage("isSystem must be a boolean"),
]

router.get("/", asyncHandler(getTags)) // 合併查詢
router.get("/:id", validateUUID, asyncHandler(getTagById))
router.post("/", validateTag, asyncHandler(createTag))
router.put("/:id", [...validateUUID, ...validateTag], asyncHandler(updateTag))
router.delete("/:id", validateUUID, asyncHandler(deleteTag))

export default router
