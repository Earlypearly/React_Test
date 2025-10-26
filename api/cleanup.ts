import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("temperature_readings")
      .delete()
      .lt("created_at", oneHourAgo);

    if (error) throw error;

    return res.status(200).json({ message: "Cleanup complete" });
  } catch (err: any) {
    console.error("Cleanup error:", err);
    return res.status(500).json({ error: err.message });
  }
}
