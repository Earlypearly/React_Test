const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || "nakatagong key";

const authRoutes = (app) => {
  // LOGIN ROUTE
  // POST NFC scan from ESP32 storing latest scan
app.post('/api/nfc-scan', async (req, res) => {
  try {
    const { nfc_uid } = req.body;
    if (!nfc_uid) return res.status(400).json({ message: "NFC UID required" });

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, name")
      .eq("nfc_uid", nfc_uid)
      .maybeSingle();

    if (userError) return res.status(500).json({ message: "Database error" });
    if (!user) return res.status(404).json({ message: "NFC card not registered" });

    // Upsert latest scan (id = 1 fixed row)
    const { error: upsertError } = await supabase
      .from("latest_nfc_scan")
      .upsert({ id: 1, nfc_uid, email: user.email, name: user.name, scanned_at: new Date() });

    if (upsertError) return res.status(500).json({ message: "Error saving latest scan" });

    return res.status(200).json({ message: "Scan recorded", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET latest NFC scan for frontend polling
app.get('/api/latest-nfc-scan', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("latest_nfc_scan")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) return res.status(500).json({ message: "Database error" });
    if (!data) return res.status(404).json({ message: "No NFC scan found" });

    res.status(200).json(data);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});


  // SIGNUP ROUTE
  app.post('/api/signup', async (req, res) => {
    try {
      const { name, email, password, nfc_uid } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password required" });
      }

      const { data: existingUser, error: userCheckErr } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (userCheckErr) {
        console.error("User check error:", userCheckErr);
        return res.status(500).json({ message: "Database error" });
      }
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      if (nfc_uid) {
        const { data: existingNfc, error: nfcCheckErr } = await supabase
          .from("users")
          .select("*")
          .eq("nfc_uid", nfc_uid)
          .maybeSingle();

        if (nfcCheckErr) {
          console.error("NFC UID check error:", nfcCheckErr);
          return res.status(500).json({ message: "Database error" });
        }
        if (existingNfc) {
          return res.status(400).json({ message: "NFC card already registered" });
        }
      }

      const { data, error } = await supabase
        .from("users")
        .insert([{ name, email, password, nfc_uid: nfc_uid || null }])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ message: "Error creating account" });
      }

      res.status(201).json({
        message: "Sign-up successful",
        user: data,
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // NFC LOOKUP ROUTE
  app.post('/api/nfc-lookup', async (req, res) => {
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
        console.error("NFC lookup error:", error);
        return res.status(500).json({ message: "Database error" });
      }

      if (!data) {
        return res.status(404).json({ message: "NFC card not registered" });
      }

      res.status(200).json({ email: data.email, name: data.name });
    } catch (err) {
      console.error("Internal error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // TOKEN VERIFICATION ROUTE
  app.get('/api/verify_token', (req, res) => {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ valid: false, message: "No token provided" });

    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({ valid: true, user: decoded });
    } catch (err) {
      return res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
  });
};

module.exports = authRoutes;
