"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Users, Code, Bot, Globe, Shield, Menu, X } from "lucide-react"

export default function Sidebar({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={sidebarRef}>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-[#0a0a0a] border border-green-500 rounded-md md:hidden"
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="text-green-500" /> : <Menu className="text-green-500" />}
      </button>
      <nav
        className={`fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-green-500 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-0 md:w-64"
        } overflow-hidden`}
        aria-label="Main navigation"
      >
        <div className="p-4 mt-16 md:mt-4 space-y-2">
          <NavItem
            icon={<MessageSquare />}
            text="Chat Rooms"
            onClick={() => {
              setActiveSection("chatRooms")
              setIsOpen(false)
            }}
          />
          <NavItem
            icon={<Users />}
            text="Forums"
            onClick={() => {
              setActiveSection("forums")
              setIsOpen(false)
            }}
          />
          <NavItem
            icon={<Code />}
            text="Collaboration"
            onClick={() => {
              setActiveSection("collaboration")
              setIsOpen(false)
            }}
          />
          <NavItem
            icon={<Bot />}
            text="AI Assistant"
            onClick={() => {
              setActiveSection("aiAssistant")
              setIsOpen(false)
            }}
          />
          <NavItem
            icon={<Globe />}
            text="News"
            onClick={() => {
              setActiveSection("news")
              setIsOpen(false)
            }}
          />
          <NavItem
            icon={<Shield />}
            text="Profile"
            onClick={() => {
              setActiveSection("profile")
              setIsOpen(false)
            }}
          />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 p-2 rounded w-full text-left hover:bg-green-900 transition text-green-400"
      aria-label={text}
    >
      {icon}
      <span>{text}</span>
    </button>
  )
}

