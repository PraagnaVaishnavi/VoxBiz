import nodemailer from "nodemailer";

// Store verification codes in memory (can be moved to Redis/db later)
const verificationCodes = {};

// Email transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
});

// Helper: Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Controller: Send code to user's email
export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const code = generateCode();
    verificationCodes[email] = code;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "VoxBiz Password Reset Code",
      text: `Your password reset code is: ${code}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};