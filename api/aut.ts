import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error || !data) {
        console.error("Login error:", error?.message || "User not found or password mismatch"); // logs to server console
        return res.status(401).json({ message: "Invalid email or password" });
      }

      return res.status(200).json({ message: "Login successful", user: data });
    } catch (err) {
      console.error("Unexpected error during login:", err); // catches unexpected errors
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
