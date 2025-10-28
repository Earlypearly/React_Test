// /api/nfc-lookup.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===== CORS HEADERS =====
  res.setHeader("Access-Control-Allow-Origin", "https://react-test-frontend.onrender.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { nfc_uid } = req.body;

    if (!nfc_uid) {
      return res.status(400).json({ message: "NFC UID required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("email, name")
      .eq("nfc_uid", nfc_uid)
      .maybeSingle();

    if (error) {
      console.error("Error looking up NFC:", error);
      return res.status(500).json({ message: "Database error" });
    }

    if (!data) {
      return res.status(404).json({ message: "NFC card not registered" });
    }

    return res.status(200).json({
      email: data.email,
      name: data.name
    });

  } catch (err: any) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
