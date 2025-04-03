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

export interface GetArticlesDto {
  query?: string 
  tagName?: string 
  authorUsername?: string 
  limit?: number 
  offset?: number 
}