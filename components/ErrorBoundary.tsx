import React from "react"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-green-400">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h1>
          <p className="mb-4">Our team has been notified and is working on a fix.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

