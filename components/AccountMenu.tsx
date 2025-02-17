"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { User, Settings, LogOut } from "lucide-react"

type DeviceType = "mobile" | "tablet" | "desktop"

export default function AccountMenu({ deviceType }: { deviceType: DeviceType }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen)

  if (!user) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Link href="/login" className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 transition-colors">
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleMenu}
        className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black hover:bg-green-400 transition-colors"
      >
        <User />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-48 bg-black border border-green-500 rounded shadow-lg"
          >
            <div className="p-2">
              <p className="text-green-400 font-bold">{user.username}</p>
              <p className="text-green-500 text-sm truncate">{user.email}</p>
            </div>
            <div className="border-t border-green-500">
              <Link
                href="/profile"
                className="block px-4 py-2 text-green-400 hover:bg-green-500 hover:text-black transition-colors"
              >
                <Settings className="inline-block w-4 h-4 mr-2" />
                Profile Settings
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500 hover:text-black transition-colors"
              >
                <LogOut className="inline-block w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

