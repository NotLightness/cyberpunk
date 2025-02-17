"use client"

import { useState, useEffect } from "react"
import { LoginForm, RegisterForm } from "../../components/AuthForms"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <BinaryBackground />
      <div className="z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {showRegister ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4 text-green-400"
        >
          {showRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setShowRegister(!showRegister)}
            className="ml-2 text-green-500 hover:text-green-400 transition-colors"
          >
            {showRegister ? "Login" : "Register"}
          </button>
        </motion.p>
      </div>
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

