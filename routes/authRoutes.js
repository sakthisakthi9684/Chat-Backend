const express = require("express");
const { registerUser, loginUser, sendOtp, verifyOtp } = require("../controllers/authController");
const router = express.Router();
// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);


// OTP & Register Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);




module.exports = router;


