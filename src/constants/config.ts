import { config } from 'dotenv'

config();

export const { 
  PORT_APP, 
  HOST_APP,
  NODE_ENV
} = process.env 

export const DATABASE_PREFIX = `"${process.env.DATABASE_PREFIX}"` || "GoodTalk"

// Frontend
export const FRONTEND_URL = "http://localhost:3000"
export const BACKEND_URL = "http://localhost:5137"

// Auth
export const JWT_SECRET = process.env.JWT_SECRET || "secret" 
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 min.
export const SALT = process.env.SALT || 10
export const RESET_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

// Email
export const EMAIL_SENDER = process.env.EMAIL_SENDER || "davelin30630@gmail.com"
export const RESEND_API_KEY = process.env.RESEND_API_KEY