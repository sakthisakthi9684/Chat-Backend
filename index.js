const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
// Import Routes
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

app.use(express.json()); // Middleware to parse JSON
app.use(cors());
const connectDB = require("./DB/db");
const { messageRoute } = require("./routes/messageRoutes");

connectDB(); // Call the function to connect to MongoDB
app.get("/", (req, res) => {
  res.json({ message: "backend running successfully!" });
});

app.use("/user", authRoutes);
app.use("/msg", messageRoute);


const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});



server.listen(5000, () => console.log("Server running on port 5000"));
