const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const JWT_SECRET = process.env.JWT_SECRET || "nakatagong key";

const app = express();
app.use(express.json());

app.post('/api/nfc-scan', async (req, res) => {
  const { nfc_uid } = req.body;
  if (!nfc_uid)
    return res.status(400).json({ message: "NFC UID required" });

  // Check if this UID exists in users table
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, nfc_uid")
    .eq("nfc_uid", nfc_uid)
    .maybeSingle();

  if (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database error" });
  }

  if (!data) {
    return res.status(404).json({ message: "NFC card not registered" });
  }

  // Optional: Record this scan in a "last_scans" table or cache if real-time update needed

  // Normally, you wouldn’t create the user here but retrieve them on scan
  res.status(200).json(data);
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

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

    const token = jwt.sign(
      { userId: data.id, email: data.email, name: data.name },
      JWT_SECRET,
      { expiresIn: '2m' }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: data.id,
        email: data.email,
        name: data.name,
        nfc_uid: data.nfc_uid,
      }
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = app;
