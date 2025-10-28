const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(cors({
  origin: "https://react-test-frontend.onrender.com",
  credentials: true
}));

// ===== SUPABASE & JWT SETUP =====
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || "nakatagong key";

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// ===== AUTH LOGIN ROUTE =====
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
      {
        userId: data.id,
        email: data.email,
        name: data.name
      },
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
        nfc_uid: data.nfc_uid
      }
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ===== NFC LOOKUP ROUTE =====
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

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ===== ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
