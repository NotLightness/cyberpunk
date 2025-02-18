import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "../contexts/AuthContext"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cyberpunk Hacker Community",
  description: "A cutting-edge platform for cybersecurity enthusiasts",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-green-400`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'