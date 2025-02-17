"use client"

import type React from "react"

import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "../contexts/AuthContext"
import Sidebar from "../components/Sidebar"
import AccountMenu from "../components/AccountMenu"
import { useDeviceType } from "../hooks/useDeviceType"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const deviceType = useDeviceType()

  return (
    <html lang="en">
      <Head>
        <title>Cyberpunk Hacker Community</title>
        <meta name="description" content="A cutting-edge platform for cybersecurity enthusiasts" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body className={`${inter.className} bg-black text-green-400`}>
        <AuthProvider>
          <div className={`flex ${deviceType === "mobile" ? "flex-col" : "flex-row"}`}>
            <Sidebar deviceType={deviceType} />
            <main
              className={`flex-1 p-4 ${
                deviceType === "mobile" ? "mt-16" : deviceType === "tablet" ? "ml-16" : "ml-64"
              }`}
            >
              <AccountMenu deviceType={deviceType} />
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
