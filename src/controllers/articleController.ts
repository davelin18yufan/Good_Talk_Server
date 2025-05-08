import { Response } from "express"
import { type AuthenticatedRequest } from "@/types"
import * as articleServices from "../services/article"
import {
  type CreateArticleDto,
  type UpdateArticleDto,
  type GetArticlesDto,
} from "../types/Article"
import { sendErrorResponse } from "@/helpers"

export const getArticles = async (
  req: AuthenticatedRequest<unknown, unknown, GetArticlesDto>,
  res: Response
) => {
  try {
    const {
      query,
      tagName,
      authorUsername,
      limit,
      offset,
      startDate,
      endDate,
      minViews,
      maxViews,
      status,
    } = req.query
    const params: GetArticlesDto = {
      query: query as string,
      tagName: tagName as string,
      authorUsername: authorUsername as string,
      limit: limit ? parseInt(limit as unknown as string) : 10,
      offset: offset ? parseInt(offset as unknown as string) : 0,
      startDate: startDate as string,
      endDate: endDate as string,
      minViews: minViews ? parseInt(minViews as unknown as string) : undefined,
      maxViews: maxViews ? parseInt(maxViews as unknown as string) : undefined,
      status,
    }

    const articles = await articleServices.getArticles(params)

    res.status(200).json(articles)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching articles", error)
  }
}

export const getPopularArticles = async (
  req: AuthenticatedRequest<unknown, unknown, GetArticlesDto>,
  res: Response
) => {
  try {
    const {
      tagName,
      limit,
      offset,
      startDate,
      endDate,
      minViews,
      maxViews,
    } = req.query
    const params: GetArticlesDto = {
      tagName: tagName as string,
      limit: limit ? parseInt(limit as unknown as string) : 10,
      offset: offset ? parseInt(offset as unknown as string) : 0,
      startDate: startDate as string,
      endDate: endDate as string,
      minViews: minViews ? parseInt(minViews as unknown as string) : undefined,
      maxViews: maxViews ? parseInt(maxViews as unknown as string) : undefined,
    }

    const articles = await articleServices.getPopularArticles(params)

    res.status(200).json(articles)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching popular articles", error)
  }
}

export const getUserArticles = async (
  req: AuthenticatedRequest<unknown, unknown, GetArticlesDto>,
  res: Response
) => {
  try {
    const {
      tagName,
      limit,
      offset,
      startDate,
      endDate,
      minViews,
      maxViews,
      status,
    } = req.query
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const params: GetArticlesDto = {
      tagName: tagName as string,
      limit: limit ? parseInt(limit as unknown as string) : 10,
      offset: offset ? parseInt(offset as unknown as string) : 0,
      startDate: startDate as string,
      endDate: endDate as string,
      minViews: minViews ? parseInt(minViews as unknown as string) : undefined,
      maxViews: maxViews ? parseInt(maxViews as unknown as string) : undefined,
      status,
    }

    const articles = await articleServices.getUserArticles(userId, params)

    res.status(200).json(articles)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching user articles", error)
  }
}

export const getArticleById = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params

    const article = await articleServices.getArticleById(id)
    if (!article) {
      res.status(404).json({ message: "Article not found" })
      return
    }

    res.status(200).json(article)
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching article", error)
  }
}

export const createArticle = async (
  req: AuthenticatedRequest<unknown, CreateArticleDto>,
  res: Response
) => {
  try {
    const data = req.body
    
    if (req.user?.id) {
      data.userId = req.user.id // author id
    }

    const newArticle = await articleServices.createArticle(data)
    res.status(201).json(newArticle)
  } catch (error) {
    sendErrorResponse(res, 500, "Error creating article", error)
  }
}

export const updateArticle = async (
  req: AuthenticatedRequest<{ id: string }, UpdateArticleDto>,
  res: Response
) => {
  try {
    const { id } = req.params
    const data = req.body

    const updatedArticle = await articleServices.updateArticle(id, data)
    res.status(200).json(updatedArticle)
  } catch (error) {
    sendErrorResponse(res, 500, "Error updating article", error)
  }
}

export const deleteArticle = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params

    await articleServices.deleteArticle(id)
    res.status(200).json({ message: "Article deleted successfully" })
  } catch (error) {
    sendErrorResponse(res, 500, "Error deleting article", error) 
  }
}
