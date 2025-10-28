import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "https://react-test-frontend.onrender.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password, nfc_uid } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking user:", checkError);
      return res.status(500).json({ message: "Database error" });
    }

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if NFC UID already exists (if provided)
    if (nfc_uid) {
      const { data: existingNfc, error: nfcCheckError } = await supabase
        .from("users")
        .select("*")
        .eq("nfc_uid", nfc_uid)
        .maybeSingle();

      if (nfcCheckError) {
        console.error("NFC check error:", nfcCheckError);
      }

      if (existingNfc) {
        return res.status(400).json({ message: "NFC card already registered" });
      }
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ 
        name, 
        email, 
        password,
        nfc_uid: nfc_uid || null  // Save NFC UID if provided
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Error creating account" });
    }

    return res.status(201).json({
      message: "Sign-up successful",
      user: { 
        id: data.id, 
        name: data.name, 
        email: data.email,
        nfc_uid: data.nfc_uid
      }
    });

  } catch (err: any) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
