import express from "express"
import { param, body } from "express-validator"
import { validate as uuidValidate } from "uuid"
import { asyncHandler } from "../middlewares"
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactions,
} from "../controllers/transactionController"
import multer from "multer"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

const validateUUID = [
  param("id").custom((value) => {
    if (!uuidValidate(value)) throw new Error("Invalid UUID")
    return true
  }),
]

const validateTransaction = [
  body("instrumentId").custom((value) => {
    if (!uuidValidate(value)) throw new Error("Invalid instrumentId UUID")
    return true
  }),
  body("transactionType")
    .notEmpty()
    .withMessage("Transaction type is required"),
  body("quantity")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be a positive number"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("commission")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Commission must be a non-negative number"),
  body("transactionDate").isISO8601().withMessage("Invalid transaction date"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
  body("planId")
    .optional()
    .custom((value) => {
      if (value && !uuidValidate(value)) throw new Error("Invalid planId UUID")
      return true
    }),
]

router.get("/", asyncHandler(getTransactions))
router.get("/:id", validateUUID, asyncHandler(getTransactionById))
router.post("/", validateTransaction, asyncHandler(createTransaction))
router.put(
  "/:id",
  [...validateUUID, ...validateTransaction],
  asyncHandler(updateTransaction)
)
router.delete("/:id", validateUUID, asyncHandler(deleteTransaction))
router.post("/upload", upload.single("file"), asyncHandler(uploadTransactions))

export default router
