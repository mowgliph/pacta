import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function generateToken(payload: any, expiresIn: string) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}
