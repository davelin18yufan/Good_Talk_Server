import { config } from 'dotenv'

config();

export const { 
  PORT_APP, 
  HOST_APP,
  NODE_ENV
} = process.env 

export const DATABASE_PREFIX = `"${process.env.DATABASE_PREFIX}"` || "GoodTalk"

// Auth
export const JWT_SECRET = process.env.JWT_SECRET || "secret" 
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 min.
export const SALT = process.env.SALT || 10
export const RESET_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds