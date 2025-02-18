"use client"

import { useState, lazy, Suspense } from "react"
import { useAuth } from "../contexts/AuthContext"
import LoginForm from "./LoginForm"
import { Onboarding } from "./Onboarding"
import { Loader2 } from "lucide-react"
import ErrorBoundary from "./ErrorBoundary"

const ChatRooms = lazy(() => import("./ChatRooms"))
const Forums = lazy(() => import("./Forums"))
const Collaboration = lazy(() => import("./Collaboration"))
const AIAssistant = lazy(() => import("./AIAssistant"))
const News = lazy(() => import("./News"))
const Profile = lazy(() => import("./Profile"))

export default function MainContent() {
  const [activeSection, setActiveSection] = useState("chatRooms")
  const { user, isOnboarded } = useAuth()

  const renderActiveSection = () => {
    return (
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin mx-auto" />}>
        {(() => {
          switch (activeSection) {
            case "chatRooms":
              return <ChatRooms />
            case "forums":
              return <Forums />
            case "collaboration":
              return <Collaboration />
            case "aiAssistant":
              return <AIAssistant />
            case "news":
              return <News />
            case "profile":
              return <Profile />
            default:
              return <ChatRooms />
          }
        })()}
      </Suspense>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!isOnboarded) {
    return <Onboarding />
  }

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto">
        <div className="mt-8">{renderActiveSection()}</div>
      </div>
    </ErrorBoundary>
  )
}

