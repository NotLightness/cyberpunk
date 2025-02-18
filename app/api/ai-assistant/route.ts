import { NextResponse } from "next/server"

const responses = {
  greeting: "Hello! How can I assist you today?",
  farewell: "Goodbye! Feel free to come back if you have more questions.",
  unknown: "I'm not sure how to respond to that. Could you please rephrase your question?",
  hacking: "I cannot assist with illegal activities. Please only use your skills ethically and legally.",
  security: "Cybersecurity is crucial. Always use strong, unique passwords and keep your software updated.",
  coding: "Programming is a valuable skill. What language are you interested in learning?",
}

export const runtime = "edge"

export async function POST(req: Request) {
  const { query } = await req.json()

  let response = responses.unknown

  if (query.toLowerCase().includes("hello") || query.toLowerCase().includes("hi")) {
    response = responses.greeting
  } else if (query.toLowerCase().includes("bye") || query.toLowerCase().includes("goodbye")) {
    response = responses.farewell
  } else if (query.toLowerCase().includes("hack") || query.toLowerCase().includes("crack")) {
    response = responses.hacking
  } else if (query.toLowerCase().includes("security") || query.toLowerCase().includes("protect")) {
    response = responses.security
  } else if (query.toLowerCase().includes("code") || query.toLowerCase().includes("program")) {
    response = responses.coding
  }

  return NextResponse.json({ response })
}

