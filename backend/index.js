import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/Auth.route.js";
import databaseRoutes from "./routes/Database.route.js";
import queryRoutes from "./routes/Query.route.js";
import queryLogRoutes from './routes/QueryLog.route.js';
import path from 'path';
import os from 'os';
import fs from 'fs/promises'; // already seems used, just confirming
import nodemailer from 'nodemailer';


import sequelize from "./config/Database.config.js";
import cookieParser from "cookie-parser";
import QueryLog from "./models/QueryLog.model.js"; // <-- important to import!
import ChatBotRoutes from "./routes/ChatBot.route.js";

// sequelize.sync({ alter: true })
//   .then(() => console.log("DB synced with altered schema"))
//   .catch((err) => console.error("DB sync error:", err));


dotenv.config();

const app = express();
// const router = express.Router();

app.use(cors({
  origin: "http://localhost:5173", // ✅ Your frontend origin
  credentials: true                // ✅ Required to send/receive cookies
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // If using cookies (like JWTs)

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/query", queryRoutes);

app.use('/api', ChatBotRoutes);
app.use('/api', queryLogRoutes);

app.post('/api/send-data-email', async (req, res) => {
  try {
    const { recipientEmail, subject, message, data, tableTitle, sendCopy } = req.body;
    
    if (!recipientEmail || !data || !Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'Invalid request parameters' });
    }
    
    // Create CSV from data
    const headers = Object.keys(data[0] || {}).join(',');
    const csvRows = data.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...csvRows].join('\n');
    
    // Create temporary file
    const tempFilePath = path.join(os.tmpdir(), `${tableTitle.replace(/\s+/g, '_')}_data_${Date.now()}.csv`);
    await fs.writeFile(tempFilePath, csvContent, 'utf8');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: subject,
      text: message,
      attachments: [
        {
          filename: `${tableTitle.replace(/\s+/g, '_')}_data.csv`,
          path: tempFilePath
        }
      ]
    };
    
    // Add CC if requested
    if (sendCopy) {
      mailOptions.cc = process.env.EMAIL_USER;
    }
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Clean up the temporary file
    await fs.unlink(tempFilePath);
    
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: `Failed to send email: ${error.message}` });
  }
});



// Start the server
const PORT = process.env.PORT  ;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});