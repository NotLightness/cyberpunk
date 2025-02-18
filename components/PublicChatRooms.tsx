"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"

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

export default function PublicChatRooms() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: "general",
      name: "General Discussion",
      description: "Main chat room for general hacking discussions",
      messages: [],
      participants: 0,
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      description: "Discuss latest cybersecurity trends and threats",
      messages: [],
      participants: 0,
    },
    {
      id: "coding",
      name: "Coding Lab",
      description: "Share and discuss coding techniques",
      messages: [],
      participants: 0,
    },
  ])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (selectedRoom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedRoom])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom || !user || isSending) return

    setIsSending(true)
    try {
      const message: Message = {
        id: Date.now().toString(),
        sender: {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
        },
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      }

      setChatRooms((rooms) =>
        rooms.map((room) => (room.id === selectedRoom.id ? { ...room, messages: [...room.messages, message] } : room)),
      )
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    messages.forEach((message) => {
      const date = new Date(message.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    return groups
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
              {Object.entries(groupMessagesByDate(selectedRoom.messages)).map(([date, messages]) => (
                <div key={date}>
                  <div className="text-center my-4">
                    <span className="px-2 py-1 text-xs text-green-500 bg-green-500/10 rounded">
                      {format(new Date(date), "MMMM d, yyyy")}
                    </span>
                  </div>
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${message.sender.id === user.id ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm`}
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
                          <span className="text-xs text-green-500/60">
                            {format(new Date(message.timestamp), "HH:mm")}
                          </span>
                        </div>
                        <p className="text-green-300">{message.content}</p>
                      </div>
                    </div>
                  ))}
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
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="bg-green-500 text-black rounded-lg p-2 hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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

