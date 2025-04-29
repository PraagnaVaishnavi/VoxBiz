import { verifyToken } from "../jwt/AuthToken.js";

 import jwt from "jsonwebtoken";

export const AuthUser = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // this must succeed or throw
    // console.log("👤 Decoded user:", decoded);

    req.user = decoded; // Attach decoded user to request
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
};


export default AuthUser;