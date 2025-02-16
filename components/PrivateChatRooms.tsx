"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

type Message = {
  id: number
  sender: string
  content: string
  timestamp: string
}

type PrivateChatRoom = {
  id: string
  name: string
  messages: Message[]
}

export default function PrivateChatRooms() {
  const [privateChatRooms, setPrivateChatRooms] = useState<PrivateChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<PrivateChatRoom | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [newRoomName, setNewRoomName] = useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const storedRooms = localStorage.getItem("privateChatRooms")
    if (storedRooms) {
      setPrivateChatRooms(JSON.parse(storedRooms))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("privateChatRooms", JSON.stringify(privateChatRooms))
  }, [privateChatRooms])

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (newRoomName.trim() && user) {
      const newRoom: PrivateChatRoom = {
        id: Math.random().toString(36).substr(2, 9),
        name: newRoomName,
        messages: [],
      }
      setPrivateChatRooms([...privateChatRooms, newRoom])
      setNewRoomName("")
      setSelectedRoom(newRoom)
    }
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    const room = privateChatRooms.find((r) => r.id === joinRoomId)
    if (room) {
      setSelectedRoom(room)
      setJoinRoomId("")
    } else {
      alert("Room not found")
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && selectedRoom && user) {
      const message: Message = {
        id: Date.now(),
        sender: user.username,
        content: newMessage,
        timestamp: new Date().toISOString(),
      }
      setPrivateChatRooms((rooms) =>
        rooms.map((room) => (room.id === selectedRoom.id ? { ...room, messages: [...room.messages, message] } : room)),
      )
      setNewMessage("")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 border-r border-green-500 pr-4">
        <h3 className="text-xl font-bold mb-2 hacker-text">Private Rooms</h3>
        <form onSubmit={handleCreateRoom} className="mb-4">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="w-full p-2 bg-[#0f0f0f] border border-green-500 rounded text-green-400 mb-2"
            placeholder="New room name..."
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-black px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Create Private Room
          </button>
        </form>
        <form onSubmit={handleJoinRoom} className="mb-4">
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="w-full p-2 bg-[#0f0f0f] border border-green-500 rounded text-green-400 mb-2"
            placeholder="Enter room ID..."
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-black px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Join Private Room
          </button>
        </form>
        {selectedRoom && (
          <div className="mt-4 p-2 bg-[#1a1a1a] rounded">
            <p className="text-green-400">Room ID: {selectedRoom.id}</p>
            <p className="text-green-400">Share this ID with friends to join your room</p>
          </div>
        )}
      </div>
      <div className="md:col-span-2">
        {selectedRoom ? (
          <>
            <h3 className="text-xl font-bold mb-2 hacker-text">{selectedRoom.name}</h3>
            <div className="h-64 overflow-y-auto mb-4 p-2 border border-green-500 rounded custom-scrollbar">
              {selectedRoom.messages.map((message) => (
                <div key={message.id} className="mb-2">
                  <span className="font-bold hacker-text">{message.sender}: </span>
                  <span className="text-green-400">{message.content}</span>
                  <span className="text-xs text-green-600 ml-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow p-2 bg-[#0f0f0f] border border-green-500 rounded-l text-green-400"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="bg-green-700 text-black px-4 py-2 rounded-r hover:bg-green-600 transition"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <p className="text-green-400">Create or join a private room to start chatting</p>
        )}
      </div>
    </div>
  )
}

