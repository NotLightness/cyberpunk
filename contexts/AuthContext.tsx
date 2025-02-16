"use client"

import type React from "react"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

type User = {
  id: string
  username: string
  profilePicture?: string
  bio?: string
}

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  register: (username: string, password: string) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  isOnboarded: boolean
  setIsOnboarded: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchProfile(token)
    }
  }, [])

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
      setIsOnboarded(response.data.isOnboarded)
    } catch (error) {
      console.error("Error fetching profile:", error)
      logout()
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:5000/login", { username, password })
      const { token } = response.data
      localStorage.setItem("token", token)
      await fetchProfile(token)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setIsOnboarded(false)
    localStorage.removeItem("token")
  }

  const register = async (username: string, password: string) => {
    try {
      await axios.post("http://localhost:5000/register", { username, password })
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const response = await axios.put("http://localhost:5000/profile", updates, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
      setIsOnboarded(true)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, isOnboarded, setIsOnboarded }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

