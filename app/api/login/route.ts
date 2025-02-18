import { type NextRequest, NextResponse } from "next/server"
import { encrypt } from "@/lib/auth"
import { cookies } from "next/headers"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const loginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        loginAttempts: true,
        lockUntil: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return NextResponse.json({ error: "Account is locked. Please try again later." }, { status: 423 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lockUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 3600000) : null,
        },
      })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
      },
    })

    const token = await encrypt({
      id: user.id,
      username: user.username,
    })

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

