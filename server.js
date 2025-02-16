const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/cyberpunk_hacker_platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePicture: String,
  bio: String,
})

const User = mongoose.model("User", UserSchema)

// Message Schema
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  room: String,
  timestamp: { type: Date, default: Date.now },
})

const Message = mongoose.model("Message", MessageSchema)

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Routes
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    })
    await user.save()
    res.status(201).send("User registered successfully")
  } catch (error) {
    res.status(500).send("Error registering user")
  }
})

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username })
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET)
    res.json({ token })
  } else {
    res.status(400).send("Invalid credentials")
  }
})

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).send("Error fetching profile")
  }
})

app.put("/profile", authenticateToken, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { bio: req.body.bio, profilePicture: req.body.profilePicture } },
      { new: true },
    ).select("-password")
    res.json(updatedUser)
  } catch (error) {
    res.status(500).send("Error updating profile")
  }
})

// Socket.io
io.on("connection", (socket) => {
  console.log("A user connected")

  socket.on("join room", (room) => {
    socket.join(room)
  })

  socket.on("chat message", async (msg) => {
    const message = new Message({
      sender: msg.sender,
      content: msg.content,
      room: msg.room,
    })
    await message.save()
    io.to(msg.room).emit("chat message", message)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected")
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

