import { PrismaClient, tags } from "@prisma/client"
import {
  GetTagsDto,
  CreateTagDto,
  UpdateTagDto,
  GetTagOptions,
} from "@/types/Tag"

const prisma = new PrismaClient()

export const getTags = async (
  params: GetTagsDto = {}, // default nothing to search all
  options: GetTagOptions = {} 
): Promise<tags[]> => {
  const { name, categoryName, limit = 10, offset = 0 } = params
  const {
    includePreferences = false,
    includeArticles = false,
    includeCategories = true,
  } = options

  return prisma.tags.findMany({
    where: {
      AND: [
        name ? { name: { contains: name, mode: "insensitive" } } : {},
        categoryName
          ? {
              tagCategories: {
                name: { contains: categoryName, mode: "insensitive" },
              },
            }
          : {},
      ],
    },
    include: {
      ...(includeCategories && { tagCategories: true }),
      ...(includePreferences && {
        userTagPreferences: {
          include: { users: { select: { username: true } } },
        },
      }),
      ...(includeArticles && {
        articleTags: { include: { articles: { select: { title: true } } } },
      }),
      users: { select: { username: true, email: true } }, // 始終包含作者
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
}

export const getTagById = async (
  id: string,
  options: GetTagOptions = {}
): Promise<tags | null> => {
  const {
    includePreferences = false,
    includeArticles = false,
    includeCategories = true,
  } = options

  return prisma.tags.findUnique({
    where: { id },
    include: {
      ...(includeCategories && { tagCategories: true }),
      ...(includePreferences && {
        userTagPreferences: {
          include: { users: { select: { username: true } } },
        },
      }),
      ...(includeArticles && {
        articleTags: { include: { articles: { select: { title: true } } } },
      }),
      users: { select: { username: true, email: true } }, // 始終包含作者
    },
  })
}

export const createTag = async (
  data: CreateTagDto,
  userId?: string
): Promise<tags> => {
  return prisma.tags.create({
    data: {
      ...data,
      isSystem: data.isSystem ?? true,
      createdBy: userId,
    },
    include: { tagCategories: true },
  })
}

export const updateTag = async (
  id: string,
  data: UpdateTagDto
): Promise<tags> => {
  return prisma.tags.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: { tagCategories: true },
  })
}

export const deleteTag = async (id: string): Promise<tags> => {
  await prisma.articleTags.deleteMany({ where: { tagId: id } })
  await prisma.userTagPreferences.deleteMany({ where: { tagId: id } })
  return prisma.tags.delete({
    where: { id },
    include: { tagCategories: true },
  })
}
