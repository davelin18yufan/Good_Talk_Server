import { IUserRequest } from "../types"

export const createUserMock: IUserRequest = {
  email: "root.company@gmail.com",
  name: "Admin",
}

export const updateUserMock: IUserRequest = {
  email: "root@gmail.com",
  name: "root",
}
