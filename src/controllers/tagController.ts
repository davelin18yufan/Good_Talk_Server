// controllers/tagController.ts
import { Response } from "express"
import { AuthenticatedRequest } from "@/types/Auth"
import * as tagServices from "../services/tag"
import {
  GetTagsDto,
  CreateTagDto,
  UpdateTagDto,
  GetTagOptions,
} from "../types/Tag"
import { sendErrorResponse } from "@/helpers"
import { safeParseBoolean } from "@/libs/utils"

export const getTags = async (
  req: AuthenticatedRequest<unknown, unknown, GetTagsDto & GetTagOptions>,
  res: Response
) => {
  try {
    const {
      name,
      categoryName,
      limit,
      offset,
      includePreferences,
      includeArticles,
      includeCategories,
    } = req.query

    const params: GetTagsDto = {
      name: name as string,
      categoryName: categoryName as string,
      limit: limit ? parseInt(limit as unknown as string) : undefined,
      offset: offset ? parseInt(offset as unknown as string) : undefined,
    }
    const options: GetTagOptions = {
      includePreferences: safeParseBoolean(includePreferences),
      includeArticles: safeParseBoolean(includeArticles),
      includeCategories: safeParseBoolean(includeCategories),
    }
    
    const tags = await tagServices.getTags(params, options)

    res.status(200).json(tags)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching tags", error)
  }
}

export const getTagById = async (
  req: AuthenticatedRequest<{ id: string }, unknown, GetTagOptions>,
  res: Response
) => {
  try {
    const { id } = req.params
    const { includePreferences, includeArticles, includeCategories } = req.query
    const options: GetTagOptions = {
      includePreferences: safeParseBoolean(includePreferences),
      includeArticles: safeParseBoolean(includeArticles),
      includeCategories: safeParseBoolean(includeCategories),
    }

    const tag = await tagServices.getTagById(id, options)
    if (!tag) {
      res.status(404).json({ message: "Tag not found" })
      return
    }

    res.status(200).json(tag)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching tag", error)
  }
}

export const createTag = async (
  req: AuthenticatedRequest<unknown, CreateTagDto>,
  res: Response
) => {
  try {
    const data = req.body
    const userId = req.user?.id

    const newTag = await tagServices.createTag(data, userId)

    res.status(201).json(newTag)
  } catch (error) {
    sendErrorResponse(res, 500, "Error creating tag", error)
  }
}

export const updateTag = async (
  req: AuthenticatedRequest<{ id: string }, UpdateTagDto>,
  res: Response
) => {
  try {
    const { id } = req.params
    const data = req.body

    const updatedTag = await tagServices.updateTag(id, data)

    res.status(200).json(updatedTag)
  } catch (error) {
    sendErrorResponse(res, 500, "Error updating tag", error)
  }
}

export const deleteTag = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params

    await tagServices.deleteTag(id)

    res.status(200).json({ message: "Tag deleted successfully" })
  } catch (error) {
    sendErrorResponse(res, 500, "Error deleting tag", error)
  }
}
