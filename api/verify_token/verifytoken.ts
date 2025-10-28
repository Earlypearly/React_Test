import { VercelRequest, VercelResponse } from "@vercel/node";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nakatagong key";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "https://react-test-frontend.onrender.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ valid: true, user: decoded });

  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, message: "Token expired" });
    }
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
}
