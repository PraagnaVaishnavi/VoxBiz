import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Get Google Auth URL
export const getGoogleAuthURL = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: "consent",
  });

  res.json({ url });
};

// Step 2: Google OAuth callback
export const handleGoogleCallback = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "No code provided" });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    let user = await User.findOne({ where: { email: googleUser.email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        username: googleUser.email.split('@')[0] + "_" + Math.floor(Math.random() * 10000),
        email: googleUser.email,
        avatar: googleUser.picture,
        googleId: googleUser.id,
        authProvider: "google",
        // tokens: { refreshToken: tokens.refresh_token }
      });
    } else {
      // Update if user already exists
      user.googleId = googleUser.id;
      user.authProvider = "google";
      user.avatar = googleUser.picture;
    //   user.tokens.refreshToken = tokens.refresh_token;
    }

    await user.save();

    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      jwt: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        isNewUser: isNewUser || !user.bio
      }
    });
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error.message
    });
  }
};