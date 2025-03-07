const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
// Import Routes
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

app.use(express.json()); // Middleware to parse JSON
app.use(cors());
const connectDB = require("./DB/db");

connectDB(); // Call the function to connect to MongoDB

const io = new Server(server, {
  cors: {
    origin: ["https://chat-backend-yqcz.onrender.com", "http://localhost:5173"], // Allow both production and development
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (messageData) => {
    console.log("New Message:", messageData);
    io.emit("message", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/api", (req, res) => {
  res.json({ message: "backend running successfully!" });
});

app.use("/user", authRoutes);

// API Route for sending messages
app.post("/messages/send", (req, res) => {
  const { message, sender } = req.body;
  if (!message || !sender) {
    return res.status(400).json({ error: "Message and sender required!" });
  }
  console.log("Received message:", req.body);
  res.json({ success: true, message: "Message sent successfully!" });
});

server.listen(5000, () => console.log("Server running on port 5000"));
