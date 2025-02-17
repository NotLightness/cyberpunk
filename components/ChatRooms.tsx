"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Send, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  sender: {
    id: string
    username: string
  }
  content: string
  timestamp: number
}

export default function ChatRooms() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [roomId, setRoomId] = useState("")
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check URL for room ID
    const urlParams = new URLSearchParams(window.location.search)
    const roomFromUrl = urlParams.get("room")
    if (roomFromUrl) {
      joinRoom(roomFromUrl)
    }
  }, [])

  const joinRoom = (id: string) => {
    setSelectedRoom(id)
    // Update URL with room ID for sharing
    window.history.pushState({}, "", `?room=${id}`)
  }

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 15)
    joinRoom(newRoomId)
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}?room=${selectedRoom}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Room link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const leaveRoom = () => {
    setSelectedRoom(null)
    setMessages([])
    // Remove room from URL
    window.history.pushState({}, "", window.location.pathname)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
      <div className="md:col-span-1 bg-black/50 p-4 rounded-lg border border-green-500">
        <h3 className="text-xl font-bold mb-4 text-green-400">Chat Rooms</h3>

        {/* Room Creation */}
        <button
          onClick={createRoom}
          className="w-full bg-green-500 text-black p-2 rounded mb-4 hover:bg-green-400 transition-colors"
        >
          Create New Room
        </button>

        {/* Room Joining */}
        <div className="space-y-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="w-full p-2 bg-black/50 border border-green-500 rounded text-green-400"
          />
          <button
            onClick={() => joinRoom(roomId)}
            className="w-full bg-green-700 text-black p-2 rounded hover:bg-green-600 transition-colors"
          >
            Join Room
          </button>
        </div>

        {/* Active Room Info */}
        {selectedRoom && (
          <div className="mt-4 p-2 bg-green-500/10 rounded">
            <p className="text-green-400 mb-2">Current Room ID: {selectedRoom}</p>
            <button
              onClick={copyRoomLink}
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Room Link"}
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="md:col-span-3 bg-black/50 rounded-lg border border-green-500 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-green-500 flex justify-between items-center">
              <h3 className="text-xl font-bold text-green-400">Room: {selectedRoom}</h3>
              <button
                onClick={leaveRoom}
                className="bg-red-500 text-black px-3 py-1 rounded hover:bg-red-400 transition-colors"
              >
                Leave Room
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.sender.id === user?.id ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${
                      message.sender.id === user?.id ? "bg-green-500/20" : "bg-blue-500/20"
                    } flex items-center justify-center text-green-400 text-sm`}
                  >
                    {message.sender.username[0].toUpperCase()}
                  </div>
                  <div
                    className={`max-w-[70%] ${
                      message.sender.id === user?.id ? "bg-green-500/20" : "bg-black/50"
                    } p-3 rounded-lg`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-green-400">{message.sender.username}</span>
                      <span className="text-xs text-green-500/60">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-green-300">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="p-4 border-t border-green-500">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-black/50 border border-green-500 rounded-lg px-4 py-2 text-green-400 placeholder-green-500/50"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="bg-green-500 text-black rounded-lg p-2 hover:bg-green-400 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-green-500/60">
            Create or join a room to start chatting
          </div>
        )}
      </div>
    </div>
  )
}

