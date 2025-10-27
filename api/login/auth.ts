import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import * as jwt from "jsonwebtoken";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || "nakatagong key";

// ✅ Define your frontend origin (must match exactly)
const allowedOrigin = "https://react-test-virid-nu.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ Set CORS headers for every response
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, PATCH");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-Token"
  );

  // ✅ Respond immediately to preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only allow POST for login
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    // 🧩 Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 🔍 Look up user by email and password
    // ⚠️ NOTE: Plaintext password check — safe only for testing.
    // In production, use bcrypt to compare hashed passwords.
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Database error" });
    }

    if (!data) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🪪 Generate JWT token
    const token = jwt.sign(
      {
        userId: data.id,
        email: data.email,
        name: data.name,
      },
      JWT_SECRET,
      { expiresIn: "2m" }
    );

    // ✅ Return success
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: data.id,
        email: data.email,
        name: data.name,
        nfc_uid: data.nfc_uid,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
