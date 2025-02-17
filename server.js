const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const helmet = require("helmet")
const xss = require("xss-clean")
const mongoSanitize = require("express-mongo-sanitize")
const { globalLimiter, authLimiter, apiLimiter } = require("./middleware/rateLimiter")
const { validateUser, validateMessage, handleValidationErrors } = require("./middleware/validator")

const app = express()
const server = http.createServer(app)

// MongoDB Atlas Free Tier Connection String
const MONGODB_URI =
  "mongodb+srv://cyberpunk-platform:vHk2VfW9X6vR@cluster0.mongodb.net/cyberpunk-platform?retryWrites=true&w=majority"

const io = new Server(server, {
  cors: {
    origin: "https://cyberpunk-peach.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Security Middleware
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())
app.use(
  cors({
    origin: "https://cyberpunk-peach.vercel.app",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10kb" }))
app.use(globalLimiter)

// Connect to MongoDB Atlas
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas")
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })

// User Schema with password validation
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
    match: [/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false, // Don't return password in queries
  },
  profilePicture: String,
  bio: {
    type: String,
    maxlength: [500, "Bio cannot exceed 500 characters"],
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
})

const User = mongoose.model("User", UserSchema)

// Message Schema with content validation
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  room: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const Message = mongoose.model("Message", MessageSchema)

// Authentication Middleware with JWT verification
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

// Routes with rate limiting and validation
app.post("/register", authLimiter, validateUser, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ username })
    if (userExists) {
      return res.status(400).json({ error: "Username already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
    })
    await user.save()

    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/login", authLimiter, validateUser, handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username }).select("+password")

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        error: "Account is locked. Please try again later.",
        lockUntil: user.lockUntil,
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      // Increment login attempts
      user.loginAttempts += 1
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 3600000 // Lock for 1 hour
      }
      await user.save()
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0
    user.lockUntil = undefined
    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" })

    res.json({ token })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Protected routes with API rate limiting
app.use("/api", apiLimiter)

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const updates = {
      bio: req.body.bio,
      profilePicture: req.body.profilePicture,
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// In-memory store for tracking connected users
const connectedUsers = new Map()

// Socket.io with authentication and rate limiting
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error("Authentication error"))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded

    // Track connected users in memory
    connectedUsers.set(decoded.id, {
      socketId: socket.id,
      username: decoded.username,
      lastActive: Date.now(),
    })

    next()
  } catch (error) {
    next(new Error("Authentication error"))
  }
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.username)

  // Clean up inactive users every 5 minutes
  const cleanup = setInterval(
    () => {
      const now = Date.now()
      for (const [userId, userData] of connectedUsers.entries()) {
        if (now - userData.lastActive > 5 * 60 * 1000) {
          connectedUsers.delete(userId)
        }
      }
    },
    5 * 60 * 1000,
  )

  socket.on("join room", (room) => {
    socket.join(room)
  })

  socket.on("chat message", async (msg) => {
    try {
      // Update user's last active timestamp
      const userData = connectedUsers.get(socket.user.id)
      if (userData) {
        userData.lastActive = Date.now()
      }

      const message = new Message({
        sender: socket.user.id,
        content: msg.content,
        room: msg.room,
      })
      await message.save()
      io.to(msg.room).emit("chat message", {
        ...message.toJSON(),
        sender: {
          id: socket.user.id,
          username: socket.user.username,
        },
      })
    } catch (error) {
      socket.emit("error", "Failed to send message")
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.username)
    connectedUsers.delete(socket.user.id)
    clearInterval(cleanup)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

