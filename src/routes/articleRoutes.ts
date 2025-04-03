import { Router } from "express"
import { body, param } from "express-validator"
import { validate as uuidValidate } from "uuid"
import { asyncHandler, auth } from "../middlewares"
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController"

const router = Router()

// Validate uuid for request
const validateUUID = [
  param("id").custom((value) => {
    if (!uuidValidate(value)) {
      throw new Error("Invalid UUID")
    }
    return true
  }),
]

const validateArticle = [
  body("title").notEmpty().withMessage("必須填入標題"),
  body("content").notEmpty().withMessage("內容是必填的"),
  body("authorId").custom((value) => {
    if (!uuidValidate(value)) {
      throw new Error("Invalid UUID for authorId")
    }
    return true
  }),
  body("status").optional().isString().withMessage("Status must be a string"),
  body("coverUrl").optional().isURL().withMessage("封面圖的連結非合法"),
  body("coverAltText")
    .optional()
    .isString()
    .withMessage("Cover Alt Text must be a string"),
  body("tagIds")
    .optional()
    .isArray()
    .withMessage("Tag IDs must be an array")
    .bail()
    .custom((tagIds: string[]) => {
      tagIds.forEach((tagId) => {
        if (!uuidValidate(tagId)) {
          throw new Error("Invalid UUID in tagIds array")
        }
      })
      return true
    }),
]

router.use(auth)

router.get("/", asyncHandler(getArticles))
router.get("/:id", validateUUID, asyncHandler(getArticleById))
router.post("/", validateArticle, asyncHandler(createArticle))
router.put(
  "/:id",
  [...validateUUID, ...validateArticle],
  asyncHandler(updateArticle)
)
router.delete("/:id", validateUUID, asyncHandler(deleteArticle))

export const articleRoutes = router
