const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

// 🔹 Generate User ID Function
const generateUserID = async () => {
  try {
    // Database-ல் இருக்கும் **latest userid**-ஐ get பண்ணும்
    const lastUser = await User.findOne().sort({ userid: -1 }); // Descending order
    if (!lastUser || !lastUser.userid) {
      return "USER0001"; // First user ID
    }

    // Last user ID-யை number-ஆ convert பண்ணி, +1 add பண்ணும்
    const lastUserID = parseInt(lastUser.userid.replace("USER", "")); // "USER1000" -> 1000
    return `USER${lastUserID + 1}`; // New ID: "USER1001"
  } catch (error) {
    console.error("❌ Error generating user ID:", error);
    return "USER1000"; // Fallback
  }
};

exports.registerUser = async (req, res) => {
  try {
    console.log("🔹 registerUser function called"); // ADD THIS

    const { username, email, password } = req.body;
    console.log("📩 Received registration request:", {
      username,
      email,
      password,
    });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userid = await generateUserID();

    // Create new user
    user = new User({ username, email, password: hashedPassword, userid });
    await user.save();

    console.log("✅ User registered successfully:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
