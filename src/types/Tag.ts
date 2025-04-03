export interface CreateTagDto {
  categoryId?: string
  name: string
  description?: string
  iconUrl?: string
  isSystem?: boolean
}

export type UpdateTagDto = Partial<CreateTagDto>

export interface GetTagsDto {
  name?: string
  categoryName?: string
  limit?: number
  offset?: number
}

export interface GetTagOptions {
  includePreferences?: boolean
  includeArticles?: boolean
  includeCategories?: boolean
}
