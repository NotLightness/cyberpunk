const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10kb" }))

// In-memory user store
const users = new Map()

// In-memory message store
const messages = []

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." })
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    res.status(403).json({ error: "Invalid token." })
  }
}

// Routes
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body

    if (users.has(username)) {
      return res.status(400).json({ error: "Username already exists" })
    }

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    users.set(username, {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
    })

    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    const user = users.get(username)

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" })

    res.json({ token })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Protected routes
app.use("/api", authenticateToken)

app.get("/api/profile", (req, res) => {
  const user = users.get(req.user.username)
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }
  const { password, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

// Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error("Authentication error"))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded
    next()
  } catch (error) {
    next(new Error("Authentication error"))
  }
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.username)

  socket.on("join room", (room) => {
    socket.join(room)
  })

  socket.on("chat message", (msg) => {
    const message = {
      id: Date.now().toString(),
      sender: socket.user.username,
      content: msg.content,
      room: msg.room,
      timestamp: new Date().toISOString(),
    }
    messages.push(message)
    io.to(msg.room).emit("chat message", message)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.username)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

