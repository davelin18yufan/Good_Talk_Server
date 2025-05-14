import type { Response } from "express"
import type { AuthenticatedRequest } from "@/types/Auth"
import * as transactionServices from "../services/transaction/trade"
import { sendErrorResponse } from "@/helpers"
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
} from "@/types/Transaction"
import XLSX from "xlsx"

export const getTransactions = async (
  req: AuthenticatedRequest<
    unknown,
    unknown,
    { limit?: number; offset?: number }
  >,
  res: Response
) => {
  try {
    const { limit, offset } = req.query
    const userId = req.user?.id
    if (!userId) throw new Error("Unauthorized")

    const transactions = await transactionServices.getTransactions({
      userId,
      limit: limit ? parseInt(limit as unknown as string) : undefined,
      offset: offset ? parseInt(offset as unknown as string) : undefined,
    })
    res.status(200).json(transactions)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching transactions", error)
  }
}

export const getTransactionById = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    if (!userId) throw new Error("Unauthorized")

    const transaction = await transactionServices.getTransactionById(id, userId)
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" })
      return
    }

    res.status(200).json(transaction)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching transaction", error)
  }
}

export const createTransaction = async (
  req: AuthenticatedRequest<unknown, CreateTransactionDto>,
  res: Response
) => {
  try {
    const data = req.body
    const userId = req.user?.id
    if (!userId) throw new Error("Unauthorized")

    const transaction = await transactionServices.createTransaction(
      data,
      userId
    )

    res.status(201).json(transaction)
  } catch (error) {
    sendErrorResponse(res, 500, "Error creating transaction", error)
  }
}

export const updateTransaction = async (
  req: AuthenticatedRequest<{ id: string }, UpdateTransactionDto>,
  res: Response
) => {
  try {
    const { id } = req.params
    const data = req.body
    const userId = req.user?.id
    if (!userId) throw new Error("Unauthorized")

    const updatedTransaction = await transactionServices.updateTransaction(
      id,
      data,
      userId
    )
    res.status(200).json(updatedTransaction)
  } catch (error) {
    sendErrorResponse(res, 500, "Error updating transaction", error)
  }
}

export const deleteTransaction = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    if (!userId) throw new Error("Unauthorized")

    await transactionServices.deleteTransaction(id, userId)
    res.status(200).json({ message: "Transaction deleted successfully" })
  } catch (error) {
    sendErrorResponse(res, 500, "Error deleting transaction", error)
  }
}

export const uploadTransactions = async (
  req: AuthenticatedRequest<unknown, unknown, unknown>,
  res: Response
) => {
  try {
    const userId = req.user?.id
    if (!userId) throw new Error("Unauthorized")
    if (!req.file) throw new Error("No file uploaded")

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet)

    const results = await transactionServices.bulkCreateTransactions(
      data,
      userId
    )
    res.status(201).json({
      message: "Transactions imported successfully",
      count: results.length,
    })
  } catch (error) {
    sendErrorResponse(res, 500, "Error importing transactions", error)
  }
}
