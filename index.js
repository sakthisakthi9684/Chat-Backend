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


// Set up WebSocket server
const wss = new WebSocket.Server({ server });


wss.on("connection", (ws) => {
  logger.info("New client connected");

  ws.on("close", () => {
    logger.info("Client disconnected");
  });
});


server.listen(5000, () => console.log("Server running on port 5000"));
