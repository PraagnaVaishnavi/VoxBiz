import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Database from "../models/Database.model.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        console.log("Registering user:", { fullName, email, password });
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
          }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({ name:fullName, email, password: hashedPassword });

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt:", req.body);

        // Find user
        const user = await User.findOne({ where: { email }, include: Database });
        console.log("User found:", user);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,         // ✅ true in production (HTTPS)
            sameSite: "Lax",       // Or "None" with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
      

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                databases: user.Databases, // Send user database list with roles
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Temporary in-memory store (better to use Redis in production)
const verificationCodes = {};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
});

// Generate 6-digit verification code
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendResetCode = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
  
    const code = generateCode();
    verificationCodes[email] = code;
  
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🛡️ Your VoxBiz Reset Code",
            text: `Hi there!\n\nHere's your password reset code: ${code}\n\nPlease do not share this with anyone.\n\nThanks,\nVoxBiz Team`,
         
      };
  
      console.log("Sending email to:", email); // ✅
      console.log("Using transporter:", transporter.options); // ✅
  
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response); // ✅
  
      res.status(200).json({ success: true, message: "Verification code sent" });
    } catch (error) {
      console.error("❌ Mail error:", error); // ✅
      res.status(500).json({ success: false, message: "Failed to send verification code" });
    }
  };

// 👉 2. Verify Code
export const verifyCode = (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Email and code are required" });
  }

  if (verificationCodes[email] !== code) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid verification code" });
  }

  res.status(200).json({ success: true, message: "Code verified" });
};

// 👉 3. Reset Password
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (verificationCodes[email] !== code) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired code" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete the code after use
    delete verificationCodes[email];

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset password" });
  }
};
export { register, login };
