"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Camera, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const [username, setUsername] = useState(user?.username || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "/placeholder.svg")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ username, bio, profilePicture })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!user) {
    return <p className="text-green-400">Access denied. Authentication required.</p>
  }

  return (
    <div className="hacker-bg p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold hacker-text">System Profile</h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-900/50 text-red-400 px-4 py-2 rounded hover:bg-red-900/70 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="relative w-32 h-32 mx-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full h-full rounded-full overflow-hidden border-2 border-green-500 hover:border-green-400 transition-colors duration-200">
                <img src={profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-8 h-8 text-green-400" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => window.open(profilePicture, "_blank")}>View Picture</DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>Change Picture</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div>
          <label htmlFor="username" className="block mb-2 text-green-400">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-black/50 border border-green-500 rounded text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block mb-2 text-green-400">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 bg-black/50 border border-green-500 rounded text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 custom-scrollbar"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-black px-4 py-2 rounded hover:bg-green-500 transition-colors duration-200"
        >
          Update Profile
        </button>
      </form>
    </div>
  )
}

