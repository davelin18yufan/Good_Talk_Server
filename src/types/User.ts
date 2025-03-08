/** database return schema */
export interface IUser {
  id: string
  name: string
  email: string
  password_hash: string
  createdAt: Date
  updatedAt: Date
}

/** response interface */
export interface UserResponseDto {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}
