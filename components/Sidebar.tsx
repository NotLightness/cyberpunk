"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import {
  Home,
  MessageSquare,
  Users,
  Newspaper,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type DeviceType = "mobile" | "tablet" | "desktop"

export default function Sidebar({ deviceType }: { deviceType: DeviceType }) {
  const [isOpen, setIsOpen] = useState(deviceType === "desktop")
  const { user, logout } = useAuth()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: deviceType === "mobile" ? "-100%" : "-240px" },
  }

  const sidebarWidth = deviceType === "mobile" ? "w-full" : deviceType === "tablet" ? "w-64" : "w-64"

  return (
    <>
      {deviceType === "mobile" && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-black/90 border-b border-green-500 flex items-center justify-between px-4 z-50">
          <h1 className="text-green-400 text-xl font-bold">Cyberpunk Hacker Community</h1>
          <button onClick={toggleSidebar} className="text-green-400">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      )}
      <motion.nav
        className={`${sidebarWidth} h-screen bg-black/90 text-green-400 fixed top-0 left-0 z-40 border-r border-green-500 ${
          deviceType === "mobile" ? "pt-16" : ""
        }`}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Menu</h2>
            {deviceType !== "mobile" && (
              <button onClick={toggleSidebar} className="text-green-400">
                {isOpen ? <ChevronLeft /> : <ChevronRight />}
              </button>
            )}
          </div>
          <ul className="space-y-4">
            <SidebarLink href="/" icon={<Home />} text="Home" />
            <SidebarLink href="/chat" icon={<MessageSquare />} text="Chat Rooms" />
            <SidebarLink href="/forums" icon={<Users />} text="Forums" />
            <SidebarLink href="/news" icon={<Newspaper />} text="News" />
            <SidebarLink href="/settings" icon={<Settings />} text="Settings" />
          </ul>
        </div>
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={logout}
              className="flex items-center justify-center w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              <LogOut className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </motion.nav>
    </>
  )
}

function SidebarLink({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
        {icon}
        <span>{text}</span>
      </Link>
    </li>
  )
}

