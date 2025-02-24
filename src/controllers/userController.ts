import { Request, Response } from "express"
import  pool from "../database/database"
import { DATABASE_PREFIX } from "../constants/config"

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${DATABASE_PREFIX}.users ORDER BY created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    throw error
  }
}

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT * FROM ${DATABASE_PREFIX}.users WHERE id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" })
      return
    }
    res.json(result.rows[0])
  } catch (error) {
    throw error
  }
}

// export const createUser = async (
//   req: Request<object, object, CreateUserDto>,
//   res: Response
// ): Promise<void> => {
//   const { name, email } = req.body
//   try {
//     const result = await pool.query(
//       `INSERT INTO ${DATABASE_PREFIX}.users (name, email) VALUES ($1, $2) RETURNING *`,
//       [name, email]
//     )
//     res.status(201).json(result.rows[0])
//   } catch (error) {
//     throw error
//   }
// }

// export const updateUser = async (
//   req: Request<{ id: string }, object, UpdateUserDto>,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params
//   const { name, email } = req.body
//   try {
//     const result = await pool.query(
//       `UPDATE ${DATABASE_PREFIX}.users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
//       [name, email, id]
//     )
//     if (result.rows.length === 0) {
//       res.status(404).json({ message: "User not found" })
//       return
//     }
//     res.json(result.rows[0])
//   } catch (error) {
//     throw error
//   }
// }

// export const deleteUser = async (
//   req: Request<{ id: string }>,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params
//   try {
//     const result = await pool.query(
//       `DELETE FROM ${DATABASE_PREFIX}.users WHERE id = $1 RETURNING *`,
//       [id]
//     )
//     if (result.rows.length === 0) {
//       res.status(404).json({ message: "User not found" })
//       return
//     }
//     res.json({ message: "User deleted successfully" })
//   } catch (error) {
//     throw error
//   }
// }
