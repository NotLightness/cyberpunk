import { NextResponse } from "next/server"

export async function GET() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL environment variable is not set" }, { status: 500 })
  }

  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: "JWT_SECRET environment variable is not set" }, { status: 500 })
  }

  return NextResponse.json({ status: "Environment variables are properly configured" })
}

