export interface CreateUserDto {
  username: string
  email: string
  passwordHash: string
  loginAttempts?: number
  lastFailedLogin?: Date
  isEMailVerified?: boolean
}

export interface UpdateUserDto {
  username?: string
  email?: string
  passwordHash?: string
  loginAttempts?: number
  lastFailedLogin?: Date
}
