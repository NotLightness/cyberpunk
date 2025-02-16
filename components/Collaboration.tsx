"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Loader2, Send } from "lucide-react"

type CollaborationSession = {
  id: string
  name: string
  participants: string[]
  code: string
}

export default function Collaboration() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null)
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Simulated fetch of collaboration sessions
    setSessions([
      { id: "1", name: "Exploit Development", participants: ["user1", "user2"], code: "// Initial exploit code" },
      {
        id: "2",
        name: "Secure Coding Practices",
        participants: ["user3", "user4"],
        code: "// Best practices for secure coding",
      },
    ])
  }, [])

  const handleJoinSession = (session: CollaborationSession) => {
    setActiveSession(session)
    setCode(session.code)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
    // In a real app, you'd send this update to other participants in real-time
  }

  const handleSaveCode = async () => {
    if (!activeSession) return

    setIsLoading(true)
    try {
      // Simulated API call to save code
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSessions(sessions.map((s) => (s.id === activeSession.id ? { ...s, code } : s)))
      setActiveSession({ ...activeSession, code })
    } catch (error) {
      console.error("Error saving code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <p className="text-green-400">Please log in to access collaboration features.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
      <div className="md:col-span-1 bg-black/50 p-4 rounded-lg border border-green-500">
        <h3 className="text-xl font-bold mb-4 text-green-400">Collaboration Sessions</h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleJoinSession(session)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                activeSession?.id === session.id ? "bg-green-500/20 border-green-500" : "hover:bg-green-500/10"
              } border border-transparent`}
            >
              <div className="font-medium text-green-400">{session.name}</div>
              <div className="text-sm text-green-500/80">{session.participants.length} participants</div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 bg-black/50 rounded-lg border border-green-500 flex flex-col">
        {activeSession ? (
          <>
            <div className="p-4 border-b border-green-500">
              <h3 className="text-xl font-bold text-green-400">{activeSession.name}</h3>
              <p className="text-sm text-green-500/80">Collaborating with: {activeSession.participants.join(", ")}</p>
            </div>

            <div className="flex-1 p-4">
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="w-full h-full bg-black/50 border border-green-500 rounded p-2 text-green-400 font-mono"
              />
            </div>

            <div className="p-4 border-t border-green-500">
              <button
                onClick={handleSaveCode}
                disabled={isLoading}
                className="w-full bg-green-500 text-black rounded py-2 font-medium hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Save and Share
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-green-500/60">
            Select a collaboration session to begin
          </div>
        )}
      </div>
    </div>
  )
}

