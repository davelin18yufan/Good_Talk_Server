import { config } from 'dotenv'

config();

export const { 
  PORT_APP, 
  HOST_APP,
  NODE_ENV
} = process.env 

export const DATABASE_PREFIX = `"${process.env.DATABASE_PREFIX}"` || "GoodTalk"