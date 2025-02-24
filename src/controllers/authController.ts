import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt, { JwtPayload } from "jsonwebtoken"
import pool from "../database/database.js"
import { RegisterRequestDto, LoginRequestDto, RegisterResponseDto, LoginResponseDto, JwtPayloadDto } from "../types"
import { DATABASE_PREFIX } from "../constants/config.js"
import { IUser } from "../types/User.js"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export const register = async (
  req: Request<object, object, RegisterRequestDto>,
  res: Response<RegisterResponseDto>
): Promise<void> => {
  const { username, email, password } = req.body

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      `SELECT * FROM ${DATABASE_PREFIX}.users WHERE email = $1`,
      [email]
    )

    if (existingUser.rows.length > 0) {
      res.status(400).json({ message: "User already exists" }) 
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const result = await pool.query(
      `INSERT INTO ${DATABASE_PREFIX}.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, hashedPassword]
    )

    // Generate JWT
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      JWT_SECRET,
      { expiresIn: "12h" }
    )

    res.status(201).json({
      user: result.rows[0],
      token,
    })
  } catch (error) {
    throw error
  }
}

export const login = async (
  req: Request<object, object, LoginRequestDto>,
  res: Response<LoginResponseDto>
): Promise<void> => {
  const { email, password } = req.body

  try {
    // Find user
    const result = await pool.query(
      `SELECT * FROM ${DATABASE_PREFIX}.users WHERE email = $1`,
      [email]
    )
    
    if (result.rows.length === 0) {
      res.status(401).json({ message: "Invalid credentials" })
      return
    }

    const user: IUser = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" })
      return
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "12h",
    })

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    throw error
  }
}

export const refreshToken = async (
  req: Request<object, object, JwtPayloadDto>,
  res: Response<LoginResponseDto>
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    res.status(401).json({ message: "No token provided" })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as string | JwtPayload
    if (typeof decoded === "string") {
      res.status(401).json({ message: "Invalid token" })
      return
    }
    const user = await pool.query(
      `SELECT * FROM ${DATABASE_PREFIX}.users WHERE id = $1`,
      [decoded.id]
    )

    if (user.rows.length === 0) {
      res.status(401).json({ message: "User not found" })
      return
    }

    const newToken = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      JWT_SECRET,
      {
        expiresIn: "12h",
      }
    )

    res.json({
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
      },
      token: newToken,
    })
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}
