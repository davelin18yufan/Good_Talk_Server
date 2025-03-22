import { CreateUserDto, UpdateUserDto } from "@/types"
import { prisma } from "@/database"

export const getAllUsers = async () => {
  return await prisma.users.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export const getUserById = async (id: string) => {
  return await prisma.users.findUnique({
    where: { id },
    include: {
      socialLinks: true,
      userAchievements: true,
      userSettings: {
        include: {
          profileVideos: true,
        },
      },
      holdings: {
        include: {
          users: true,
          
        },
      },
      userTagPreferences: true,
      followersRelation: {
        include: {
          follower: true,
        },
      },
      followingRelation: {
        include: {
          following: true,
        },
      },
      _count: {
        select: {
          followersRelation: true, // 粉絲數量
          followingRelation: true, // 追蹤數量
        },
      },
    },
  })
}

export const getUserByEmail = async (email: string) => {
  return await prisma.users.findUnique({
    where: { email },
    include: {
      socialLinks: true,
      userAchievements: true,
      userSettings: {
        include: {
          profileVideos: true,
        },
      },
      userTagPreferences: true,
    },
  })
}

export const createUser = async (data: CreateUserDto) => {
  return await prisma.users.create({
    data,
  })
}

export const updateUser = async (id: string, data: UpdateUserDto) => {
  return await prisma.users.update({
    where: { id },
    data,
  })
}

export const deleteUser = async (id: string) => {
  return await prisma.users.delete({
    where: { id },
  })
}

export const changePassword = async (email: string, passwordHash: string) => {
  return await prisma.users.update({
    where: { email },
    data: { passwordHash },
  })
}
