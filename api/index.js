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

// ===== CLEANUP ROUTE =====
app.delete('/api/cleanup', async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("temperature_readings")
      .delete()
      .lt("created_at", oneHourAgo);

    if (error) throw error;

    return res.status(200).json({ message: "Cleanup complete" });
  } catch (err) {
    console.error("Cleanup error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ===== TOKEN VERIFICATION ROUTE =====
app.get('/api/verify_token', (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ valid: false, message: "No token provided" });

  const token = auth.split(' ')[1]; // removes "Bearer "
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
});

// ===== TEMPERATURE DATA ROUTES =====
// POST - Save temperature and humidity
app.post('/api/temp', async (req, res) => {
  try {
    const { userId, temperature, humidity } = req.body;

    if (!userId || temperature === undefined || humidity === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("temperature_readings")
      .insert([{ user_id: userId, temperature, humidity }])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: "Saved", data });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET - Fetch latest temperature reading
app.get('/api/temp', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const { data, error } = await supabase
      .from("temperature_readings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Query error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
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
