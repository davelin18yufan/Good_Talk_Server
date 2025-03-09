import { PrismaClient } from "@prisma/client"
import { CreateUserDx, UpdateUserDx } from "../types"

const prisma = new PrismaClient()

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
  })
}

export const getUserByEmail = async (email: string) => {
  return await prisma.users.findUnique({
    where: { email },
  })
}

export const createUser = async (data: CreateUserDx) => {
  return await prisma.users.create({
    data,
  })
}

export const updateUser = async (id: string, data: UpdateUserDx) => {
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
