import { PrismaClient, articles } from "@prisma/client"
import {
  type CreateArticleDto,
  type UpdateArticleDto,
  type GetArticlesDto,
} from "@/types"

const prisma = new PrismaClient()

export const getArticles = async (
  params: GetArticlesDto = {} // default nothing to search all
): Promise<articles[]> => {
  const { query, tagName, authorUsername, limit = 10, offset = 0 } = params
  return prisma.articles.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        tagName
          ? {
              articleTags: {
                some: {
                  tags: { name: { equals: tagName, mode: "insensitive" } },
                },
              },
            }
          : {},
        authorUsername
          ? {
              users: {
                username: { equals: authorUsername, mode: "insensitive" },
              },
            }
          : {},
      ],
    },
    include: {
      users: {
        select: {
          username: true,
          email: true,
        },
        include: { userSettings: { select: { aka: true } } },
      },
      articleTags: {
        include: {
          tags: {
            include: { tagCategories: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })
}

export const getArticleById = async (id: string): Promise<articles | null> => {
  return prisma.articles.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          username: true,
          email: true,
        },
        include: { userSettings: { select: { aka: true } } },
      },
      articleTags: {
        include: {
          tags: {
            include: { tagCategories: true }, 
          },
        },
      },
    },
  })
}

export const createArticle = async (
  data: CreateArticleDto
): Promise<articles> => {
  const { tagIds, ...articleData } = data

  return prisma.articles.create({
    data: {
      ...articleData,
      status: articleData.status || "DRAFT",
      coverUrl: articleData.coverUrl || "https://placehold.co/900x600",
      coverAltText: articleData.coverAltText || "Cover image",
      // create an new one if not exist
      articleTags: tagIds
        ? {
            create: tagIds.map((tagId) => ({
              tagId,
            })),
          }
        : undefined,
    },
    include: {
      users: { select: { username: true, email: true } },
      articleTags: { include: { tags: true } },
    },
  })
}

export const updateArticle = async (
  id: string,
  data: UpdateArticleDto
): Promise<articles> => {
  const { tagIds, ...articleData } = data
  return prisma.articles.update({
    where: { id },
    data: {
      ...articleData,
      updatedAt: new Date(),
      articleTags: tagIds
        ? {
            deleteMany: {}, // delete current tags
            create: tagIds.map((tagId) => ({ // then add new
              tagId,
            })),
          }
        : undefined,
    },
    include: {
      users: { select: { username: true, email: true } },
      articleTags: { include: { tags: true } },
    },
  })
}

export const deleteArticle = async (id: string): Promise<articles> => {
  // 先刪除相關的 articleTags
  await prisma.articleTags.deleteMany({
    where: { articleId: id },
  })
  return prisma.articles.delete({
    where: { id },
    include: {
      users: { select: { username: true, email: true } },
      articleTags: { include: { tags: true } },
    },
  })
}