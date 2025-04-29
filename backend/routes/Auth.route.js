import express from "express";
import { register, login , sendResetCode , verifyCode , resetPassword} from "../controllers/Auth.controller.js";
import { getGoogleAuthURL, handleGoogleCallback } from "../controllers/GoogleAuth.controller.js";

import AuthUser from "../middleware/AuthUser.js";
const router = express.Router();

router.post("/register" ,register);
router.post("/login",login);
router.post("/send-reset-code", sendResetCode);
router.post("/verify", verifyCode);
router.post("/reset-password", resetPassword);
router.get("/google-url", getGoogleAuthURL);
router.post("/google/callback", handleGoogleCallback);


export default router;