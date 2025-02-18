"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    window.addEventListener("online", () => setIsOnline(true))
    window.addEventListener("offline", () => setIsOnline(false))

    return () => {
      window.removeEventListener("online", () => setIsOnline(true))
      window.removeEventListener("offline", () => setIsOnline(false))
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <BinaryBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center"
      >
        <h1 className="text-4xl font-bold text-green-400 mb-4">You are offline</h1>
        <p className="text-xl text-green-300">Your security is our priority</p>
        <p className="text-green-400 mt-4">Please check your internet connection and try again.</p>
      </motion.div>
    </div>
  )
}

function BinaryBackground() {
  useEffect(() => {
    const canvas = document.getElementById("binary-bg") as HTMLCanvasElement
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const binary = "10"
    const fontSize = 10
    const columns = canvas.width / fontSize

    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#00ff00"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = binary[Math.floor(Math.random() * binary.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)

    return () => clearInterval(interval)
  }, [])

  return <canvas id="binary-bg" className="absolute inset-0" />
}

