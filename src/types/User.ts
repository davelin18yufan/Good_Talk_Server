export interface CreateUserDto {
  username: string
  email: string
  passwordHash: string
  loginAttempts?: number
  lastFailedLogin?: Date
}

export interface UpdateUserDto {
  username?: string
  email?: string
  passwordHash?: string
  loginAttempts?: number
  lastFailedLogin?: Date
}
