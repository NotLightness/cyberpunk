import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const session = await updateSession(request)

  // Protect all routes except public ones
  if (
    !session &&
    !request.nextUrl.pathname.match(/^\/api\/(login|register)$/) &&
    !request.nextUrl.pathname.match(/^\/(login|register)$/)
  ) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

