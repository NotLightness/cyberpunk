"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import AccountMenu from "./AccountMenu"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop")

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType("mobile")
      } else if (width < 1024) {
        setDeviceType("tablet")
      } else {
        setDeviceType("desktop")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar deviceType={deviceType} />
      <main className={`flex-1 p-4 ${deviceType === "mobile" ? "mt-16" : "md:ml-64"}`}>
        <AccountMenu deviceType={deviceType} />
        {children}
      </main>
    </div>
  )
}

