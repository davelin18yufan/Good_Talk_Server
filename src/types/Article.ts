export interface CreateArticleDto {
  userId?: string
  title: string
  content: string
  status?: string
  coverUrl?: string
  coverAltText?: string
  tagIds?: string[]
}

export type UpdateArticleDto = Partial<CreateArticleDto>
export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface GetArticlesDto {
  query?: string
  tagName?: string
  authorUsername?: string
  limit?: number
  offset?: number
  startDate?: Date | string
  endDate?: Date | string
  minViews?: number
  maxViews?: number
  status?: ArticleStatus
}