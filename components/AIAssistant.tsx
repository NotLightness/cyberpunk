"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Send, Loader2, Bot, Trash2 } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedModel, setSelectedModel] = useState("deepseek")

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]) // Updated dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await axios.post("/api/ai-assistant", {
        query: input.trim(),
        model: selectedModel,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
  }

  if (!user) {
    return <p className="text-green-400">Please log in to access the AI Assistant.</p>
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-black/50 rounded-lg border border-green-500">
      <div className="p-4 border-b border-green-500 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-green-400">AI Neural Interface</h2>
          <div className="flex items-center gap-2 mt-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-black/50 border border-green-500 rounded px-2 py-1 text-sm text-green-400"
            >
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Google Gemini</option>
              <option value="llama">Llama</option>
            </select>
            <button
              onClick={clearConversation}
              className="flex items-center gap-1 px-2 py-1 text-sm text-red-400 hover:bg-red-500/10 rounded"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-green-500/60">
            <Bot className="w-12 h-12 mb-2" />
            <p>How can I assist you today?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full ${
                  message.role === "user" ? "bg-green-500/20" : "bg-blue-500/20"
                } flex items-center justify-center`}
              >
                {message.role === "user" ? (
                  <span className="text-green-400">{user.username[0].toUpperCase()}</span>
                ) : (
                  <Bot className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div
                className={`max-w-[70%] ${
                  message.role === "user" ? "bg-green-500/20" : "bg-blue-500/20"
                } p-3 rounded-lg`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium ${message.role === "user" ? "text-green-400" : "text-blue-400"}`}>
                    {message.role === "user" ? user.username : "AI Assistant"}
                  </span>
                  <span className="text-xs text-green-500/60">{format(new Date(message.timestamp), "HH:mm")}</span>
                </div>
                <p className={message.role === "user" ? "text-green-300" : "text-blue-300"}>{message.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-green-500">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-black/50 border border-green-500 rounded-lg px-4 py-2 text-green-400 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ask me anything..."
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
    </div>
  )
}

