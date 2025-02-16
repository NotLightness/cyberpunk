"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import io from "socket.io-client"

type Message = {
  id: string
  sender: {
    id: string
    username: string
    profilePicture?: string
  }
  content: string
  timestamp: string
}

type ChatRoom = {
  id: string
  name: string
  description: string
  messages: Message[]
  participants: number
}

const socket = io("http://localhost:5000")

export default function ChatRooms() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatRooms()
    socket.on("message", handleNewMessage)
    return () => {
      socket.off("message", handleNewMessage)
    }
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      socket.emit("join room", selectedRoom.id)
    }
  }, [selectedRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesEndRef]) //Corrected dependency

  const fetchChatRooms = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/chat-rooms")
      const data = await response.json()
      setChatRooms(data)
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
    }
  }

  const handleNewMessage = (message: Message) => {
    if (selectedRoom && message.id.startsWith(selectedRoom.id)) {
      setSelectedRoom((prev) => ({
        ...prev!,
        messages: [...prev!.messages, message],
      }))
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom || isLoading) return

    setIsLoading(true)
    socket.emit("chat message", {
      roomId: selectedRoom.id,
      content: newMessage.trim(),
      sender: {
        id: user!.id,
        username: user!.username,
        profilePicture: user!.profilePicture,
      },
    })
    setNewMessage("")
    setIsLoading(false)
  }

  if (!user) {
    return <p className="text-green-400">Please log in to access chat rooms.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
      <div className="md:col-span-1 bg-black/50 p-4 rounded-lg border border-green-500">
        <h3 className="text-xl font-bold mb-4 text-green-400">Chat Rooms</h3>
        <div className="space-y-2">
          {chatRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedRoom?.id === room.id ? "bg-green-500/20 border-green-500" : "hover:bg-green-500/10"
              } border border-transparent`}
            >
              <div className="font-medium text-green-400">{room.name}</div>
              <div className="text-sm text-green-500/80">{room.description}</div>
              <div className="text-xs text-green-500/60 mt-1">{room.participants} online</div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 bg-black/50 rounded-lg border border-green-500 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-green-500">
              <h3 className="text-xl font-bold text-green-400">{selectedRoom.name}</h3>
              <p className="text-sm text-green-500/80">{selectedRoom.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {selectedRoom.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.sender.id === user.id ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${
                      message.sender.id === user.id ? "bg-green-500/20" : "bg-blue-500/20"
                    } flex items-center justify-center text-green-400 text-sm`}
                  >
                    {message.sender.username[0].toUpperCase()}
                  </div>
                  <div
                    className={`max-w-[70%] ${
                      message.sender.id === user.id ? "bg-green-500/20" : "bg-black/50"
                    } p-3 rounded-lg`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-green-400">{message.sender.username}</span>
                      <span className="text-xs text-green-500/60">{format(new Date(message.timestamp), "HH:mm")}</span>
                    </div>
                    <p className="text-green-300">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-green-500">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-black/50 border border-green-500 rounded-lg px-4 py-2 text-green-400 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-500 text-black rounded-lg p-2 hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-green-500/60">
            Select a room to start chatting
          </div>
        )}
      </div>
    </div>
  )
}

