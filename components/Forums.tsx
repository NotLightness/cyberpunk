"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { MessageSquare, ThumbsUp, Flag, Share2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"

type ForumPost = {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    profilePicture?: string
  }
  timestamp: string
  likes: number
  replies: number
  tags: string[]
  isLiked?: boolean
}

export default function Forums() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/forum-posts")
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.title.trim() || !newPost.content.trim()) return

    setIsLoading(true)
    try {
      const response = await axios.post("http://localhost:5000/api/forum-posts", {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        tags: newPost.tags.split(",").map((tag) => tag.trim()),
      })
      setPosts((prev) => [response.data, ...prev])
      setNewPost({ title: "", content: "", tags: "" })
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/forum-posts/${postId}/like`)
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !post.isLiked,
              }
            : post,
        ),
      )
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()

  const filteredPosts = selectedTag ? posts.filter((post) => post.tags.includes(selectedTag)) : posts

  if (!user) {
    return <p className="text-green-400">Please log in to access forums.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 space-y-4">
        <div className="bg-black/50 p-4 rounded-lg border border-green-500">
          <h3 className="text-lg font-bold text-green-400 mb-2">Tags</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`w-full text-left px-2 py-1 rounded ${
                !selectedTag ? "bg-green-500/20 text-green-400" : "text-green-500/60 hover:bg-green-500/10"
              }`}
            >
              All Posts
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`w-full text-left px-2 py-1 rounded ${
                  selectedTag === tag ? "bg-green-500/20 text-green-400" : "text-green-500/60 hover:bg-green-500/10"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="bg-black/50 p-4 rounded-lg border border-green-500">
          <h3 className="text-lg font-bold text-green-400 mb-4">Create Post</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full bg-black/50 border border-green-500 rounded px-3 py-2 text-green-400 placeholder-green-500/50"
              placeholder="Post title"
              required
            />
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full bg-black/50 border border-green-500 rounded px-3 py-2 text-green-400 placeholder-green-500/50 min-h-[100px]"
              placeholder="Post content"
              required
            />
            <input
              type="text"
              value={newPost.tags}
              onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              className="w-full bg-black/50 border border-green-500 rounded px-3 py-2 text-green-400 placeholder-green-500/50"
              placeholder="Tags (comma-separated)"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-black rounded py-2 font-medium hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Post"}
            </button>
          </div>
        </form>
      </div>

      <div className="md:col-span-3 space-y-4">
        {filteredPosts.map((post) => (
          <article key={post.id} className="bg-black/50 p-4 rounded-lg border border-green-500">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                {post.author.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-400">{post.title}</h3>
                <div className="flex items-center gap-2 text-sm text-green-500/60">
                  <span>{post.author.username}</span>
                  <span>•</span>
                  <span>{format(new Date(post.timestamp), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
            <p className="text-green-300 mb-4">{post.content}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-sm bg-green-500/10 text-green-400 rounded">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-green-500/60">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1 hover:text-green-400 ${post.isLiked ? "text-green-400" : ""}`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-green-400">
                <MessageSquare className="w-4 h-4" />
                <span>{post.replies} replies</span>
              </button>
              <button className="flex items-center gap-1 hover:text-green-400">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-1 hover:text-red-400">
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

