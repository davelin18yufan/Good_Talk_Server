import type { Request, Response } from "express"
import { recalculatePerformance } from "../services/transaction/performance"
import type { ChartData } from "@/types/Transaction"
import { sendErrorResponse } from "@/helpers"

// Get performance data for a user
export const getPerformance = async (req: Request, res: Response) => {
  const userId = req.params.userId

  // Validate userId
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ error: "Invalid or missing userId" })
    return
  }

  try {
    const performanceData: ChartData = await recalculatePerformance(userId)
    res.status(200).json(performanceData)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching performance data", error)
  }
}
