import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password }]);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: "User registered successfully", user: data });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
