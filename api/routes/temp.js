const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tempRoutes = (app) => {
  // ===== POST Temperature Data =====
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

  // ===== GET Latest Temperature =====
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
};

module.exports = tempRoutes;
