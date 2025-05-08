import { Response } from "express"
import * as planService from "../services/transaction/plan"
import {
  CreateInvestmentPlanDto,
  UpdateInvestmentPlanDto,
} from "@/types/Plan"
import { AuthenticatedRequest } from "@/types/Auth"
import { sendErrorResponse } from "../helpers"

export const getUserPlans = async (
  req: AuthenticatedRequest<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.params
    const plans = await planService.getUserPlans(userId)
    res.json(plans)
  } catch (error: any) {
    sendErrorResponse(res, 500, "Error fetching plans", error)
  }
}

export const createPlan = async (
  req: AuthenticatedRequest<{ userId: string }, CreateInvestmentPlanDto>,
  res: Response
) => {
  try {
    const { userId } = req.params
    const data = req.body
    const newPlan = await planService.createPlan(userId, data)
    res.status(201).json(newPlan)
  } catch (error: any) {
    sendErrorResponse(res, 500, "Error creating plan", error)
  }
}

export const updatePlan = async (
  req: AuthenticatedRequest<
    { userId: string; planId: string },
    UpdateInvestmentPlanDto
  >,
  res: Response
) => {
  try {
    const { userId, planId } = req.params
    const data = req.body
    const updatedPlan = await planService.updatePlan(userId, planId, data)
    res.json(updatedPlan)
  } catch (error: any) {
    sendErrorResponse(res, 500, "Error updating plan", error)
  }
}

export const deletePlan = async (
  req: AuthenticatedRequest<{ userId: string; planId: string }>,
  res: Response
) => {
  try {
    const { userId, planId } = req.params
    await planService.deletePlan(userId, planId)
    res.json({ message: "Plan deleted successfully" })
  } catch (error: any) {
    sendErrorResponse(res, 500, "Error deleting plan", error)
  }
}

export const togglePlanExecuted = async (
  req: AuthenticatedRequest<{ userId: string; planId: string }>,
  res: Response
) => {
  try {
    const { userId, planId } = req.params
    const updatedPlan = await planService.togglePlanExecuted(userId, planId)
    res.json(updatedPlan)
  } catch (error: any) {
    sendErrorResponse(res, 500, "Error marking plan as executed", error)
  }
}
