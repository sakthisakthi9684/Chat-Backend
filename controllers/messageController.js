const Message = require("../models/messageModel");

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { message, sender } = req.body;
    console.log("Received message:", req.body);

    if (!message || !sender) {
      return res.status(400).json({ error: "Message and sender required!" });
    }

    // Store message in MongoDB
    const newMessage = new Message({ message, sender });
    await newMessage.save();

    res.json({ success: true, message: "Message stored successfully!", data: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Get Messages
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getMessagesbyUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};