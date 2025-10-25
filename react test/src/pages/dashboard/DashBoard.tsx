import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;

    if (!userId) {
      console.error("User not logged in");
      navigate("/login");
      return;
    }

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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🌡️ Temperature Monitor</h1>
        <div className="header-user">
          <span className="user-name">👤 {user.name || "User"}</span>
          <button onClick={handleLogout} className="logout-btn" style={{ maxWidth: "120px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Temperature Card */}
          <div className="temp-card">
            <div className="temp-icon">🌡️</div>
            <div className="temp-value">
              {loading ? "Loading..." : `${temp?.toFixed(1)}°C`}
            </div>
            <div className="temp-label">Temperature</div>
          </div>

          {/* Humidity Card */}
          <div className="humidity-card">
            <div className="humidity-icon">💧</div>
            <div className="humidity-value">
              {loading ? "Loading..." : `${humidity?.toFixed(1)}%`}
            </div>
            <div className="humidity-label">Humidity</div>
          </div>

          {/* Status Section */}
          <div className="status-section">
            <h3>System Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <div className="status-label">Connection</div>
                <div className="status-value">✅ Connected</div>
              </div>
              <div className="status-item">
                <div className="status-label">Last Update</div>
                <div className="status-value">Just now</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
