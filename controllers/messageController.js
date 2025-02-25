const Message = require('../models/messageModel');

// Send Message
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Messages
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({ $or: [{ senderId: userId }, { receiverId: userId }] }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
