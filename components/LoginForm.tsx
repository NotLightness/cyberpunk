"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isRegistering) {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long")
        }
        if (!/[A-Z]/.test(password)) {
          throw new Error("Password must contain at least one uppercase letter")
        }
        if (!/[0-9]/.test(password)) {
          throw new Error("Password must contain at least one number")
        }
        await register(username, password)
      } else {
        await login(username, password)
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (user) return null

  return (
    <div className="max-w-md mx-auto my-8 relative">
      <div className="relative z-10 bg-black/90 p-8 rounded-lg border border-green-500 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
          {isRegistering ? "Initialize New Account" : "System Access"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-green-500" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-black/50 border border-green-500 rounded text-green-400 placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Username"
              required
              disabled={isLoading}
              minLength={3}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-green-500" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-black/50 border border-green-500 rounded text-green-400 placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Password"
              required
              disabled={isLoading}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-green-500" />
              ) : (
                <Eye className="h-5 w-5 text-green-500" />
              )}
            </button>
          </div>
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-green-600 text-black font-bold rounded hover:bg-green-500 transition-colors duration-200 relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                <span>{isRegistering ? "Initialize Account" : "Access System"}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-green-400 hover:text-green-300 text-sm transition-colors duration-200"
              disabled={isLoading}
            >
              {isRegistering ? ">> Return to Login" : ">> New User Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

