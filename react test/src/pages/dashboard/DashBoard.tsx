import { useState, useEffect } from "react";
import "./DashBoard.css";

const Dashboard = () => {
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user ID from localStorage (set during login)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    // Poll temperature every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://react-api-pink.vercel.app/api/temp?userId=${userId}`
        );
        const data = await response.json();
        
        if (data.temperature !== undefined) {
          setTemp(data.temperature);
          setHumidity(data.humidity);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching temperature:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Live Dashboard</h1>
        
        <div className="temp-card">
          <div className="temp-icon">🌡️</div>
          <div className="temp-value">
            {loading ? "Loading..." : `${temp?.toFixed(1)}°C`}
          </div>
          <div className="temp-label">Temperature</div>
        </div>

        <div className="humidity-card">
          <div className="humidity-icon">💧</div>
          <div className="humidity-value">
            {loading ? "Loading..." : `${humidity?.toFixed(1)}%`}
          </div>
          <div className="humidity-label">Humidity</div>
        </div>

        <button onClick={() => window.location.href = "/logout"} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
