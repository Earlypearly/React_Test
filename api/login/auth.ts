// /api/auth.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import * as jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || "nakatagong key";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===== CORS HEADERS - ADD THESE =====
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "https://react-test-virid-nu.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
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

    const token  = jwt.sign(
      {
        userId: data.id,
        email: data.email,
        name: data.name
      },
      JWT_SECRET,
      {expiresIn: '2m'}
    );

    return res.status(200).json({
    message: "Login successful",
    token, // 👈 send the token to the frontend
    user: {
      userId: data.id,
      email: data.email,
      name: data.name,
      nfc_uid: data.nfc_uid
    }
  });

  } catch (err: any) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}