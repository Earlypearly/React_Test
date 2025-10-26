import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
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
    } catch (err: any) {
      console.error("Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
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
    } catch (err: any) {
      console.error("Error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
}
