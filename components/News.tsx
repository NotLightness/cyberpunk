"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import { Loader2 } from "lucide-react"

type NewsItem = {
  _id: string
  title: string
  content: string
  source: string
  timestamp: string
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/news", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNews(response.data)
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <p className="text-green-400">Please log in to access news.</p>
  }

  return (
    <div className="hacker-bg p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 hacker-text">Latest Cybersecurity News</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item._id} className="p-4 border border-green-500 rounded hover:bg-[#1a1a1a] transition">
              <h3 className="text-lg font-semibold hacker-text">{item.title}</h3>
              <p className="text-sm text-green-400 mt-1">{item.content}</p>
              <p className="text-sm text-green-600 mt-2">
                Source: {item.source} | {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

