"use client"

import { useState, lazy, Suspense } from "react"
import { AuthProvider, useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Footer from "../components/Footer"
import LoginForm from "../components/LoginForm"
import { Onboarding } from "../components/Onboarding"
import { Loader2 } from "lucide-react"
import ErrorBoundary from "../components/ErrorBoundary"

const ChatRooms = lazy(() => import("../components/ChatRooms"))
const Forums = lazy(() => import("../components/Forums"))
const Collaboration = lazy(() => import("../components/Collaboration"))
const AIAssistant = lazy(() => import("../components/AIAssistant"))
const News = lazy(() => import("../components/News"))
const Profile = lazy(() => import("../components/Profile"))

function MainContent() {
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
    <>
      <Header />
      <div className="flex">
        <Sidebar setActiveSection={setActiveSection} />
        <main className="flex-grow p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mt-8">{renderActiveSection()}</div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-[#0f0f0f] text-green-400 binary-bg">
          <MainContent />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

