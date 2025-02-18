import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const SECRET_KEY = process.env.JWT_SECRET!
const key = new TextEncoder().encode(SECRET_KEY)

export async function encrypt(payload: any) {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(key)
}

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const token = cookies().get("token")?.value
  if (!token) return null
  return await decrypt(token)
}

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) return null

  const session = await decrypt(token)
  if (!session) return null

  if (session.exp && session.exp - Date.now() / 1000 < 60 * 30) {
    const newToken = await encrypt(session)
    cookies().set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    })
  }

  return session
}

