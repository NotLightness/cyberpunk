"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const steps = [
  {
    title: "Welcome to the Cyberpunk Hacker Community",
    description: "Let's set up your profile to get started.",
  },
  {
    title: "Choose your hacker alias",
    description: "This will be your display name in the community.",
  },
  {
    title: "Set your bio",
    description: "Tell us a bit about yourself and your interests.",
  },
  {
    title: "Choose your avatar",
    description: "Select an image to represent you in the community.",
  },
]

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [alias, setAlias] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  const { updateProfile } = useAuth()

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = async () => {
    try {
      await updateProfile({ username: alias, bio, profilePicture: avatar })
      // Redirect to main app or show completion message
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Enter your hacker alias"
            className="bg-black/50 border-green-500 text-green-400"
          />
        )
      case 2:
        return (
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            className="bg-black/50 border-green-500 text-green-400"
          />
        )
      case 3:
        return (
          <Input
            type="file"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            accept="image/*"
            className="bg-black/50 border-green-500 text-green-400"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-black/80 border border-green-500 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-400">{steps[currentStep].title}</h2>
      <p className="mb-6 text-green-300">{steps[currentStep].description}</p>
      {renderStepContent()}
      <Button onClick={handleNext} className="mt-6 w-full bg-green-500 text-black hover:bg-green-400">
        {currentStep === steps.length - 1 ? "Finish" : "Next"}
      </Button>
    </div>
  )
}

