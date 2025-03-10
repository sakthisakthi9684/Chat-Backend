const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const OTP = require("../model/otpModel"); // OTP Model
const nodemailer = require("nodemailer");

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
    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sivasakthi26082000@gmail.com",
    pass: "htrhxzlmjqsyyfty",
  },
});

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    if (!lowerCaseEmail) {
      return res.status(400).json({ message: "Invalid email" });
    }

    console.log("🔹 sendOtp function called");
    console.log("📩 Received OTP request for:", lowerCaseEmail);

    // 🔹 **Check if the email is already registered**
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      console.log("⚠️ Email already exists:", lowerCaseEmail);
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔹 **Check if an OTP already exists for this email**
    const existingOtp = await OTP.findOne({ email: lowerCaseEmail });

    if (existingOtp) {
      const otpExpiry = existingOtp.createdAt.getTime() + 5 * 60 * 1000; // 5 mins validity
      if (Date.now() < otpExpiry) {
        console.log("⚠️ OTP already sent recently:", existingOtp.otp);
        return res
          .status(400)
          .json({ message: "OTP already sent. Try again later." });
      }
    }

    // 🔹 **Generate new OTP**
    const otpCode = generateOTP();
    console.log("🔢 Generated OTP:", otpCode);

    // 🔹 **Save/Update OTP**
    await OTP.findOneAndUpdate(
      { email: lowerCaseEmail },
      { otp: otpCode, createdAt: Date.now() },
      { upsert: true }
    );

    // 🔹 **Send OTP via email**
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: lowerCaseEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otpCode}. This code is valid for 5 minutes.`,
    });

    console.log("✅ OTP sent successfully to:", lowerCaseEmail);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("Email:", email);
    console.log("OTP:", otp);

    // Ensure email is always stored and queried in lowercase
    const lowerCaseEmail = email.toLowerCase();

    const otpRecord = await OTP.findOne({ email: lowerCaseEmail });

    console.log("OTP Record Found:", otpRecord);

    if (!otpRecord) {
      console.log("No OTP record found for this email.");
      return res.status(400).json({ message: "OTP Invalid" });
    }

    if (`${otpRecord.otp}` !== `${otp}`) {
      console.log("Entered OTP does not match.");
      return res.status(400).json({ message: "OTP Invalid" });
    }

    if (otpRecord.expiry && otpRecord.expiry < Date.now()) {
      console.log("OTP Expired.");
      return res.status(400).json({ message: "OTP Expired" });
    }

    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
