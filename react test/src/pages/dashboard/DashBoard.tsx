import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

const Dashboard = () => {
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);

      const fetchData = async () => {
        try {
          const response = await fetch(
            `https://react-api-pink.vercel.app/api/temp?userId=${parsed.userId}`
          );
          const data = await response.json();
          if (response.ok && data) {
            setTemp(data.temperature);
            setHumidity(data.humidity);
          } else {
            console.error("Failed to fetch temperature:", data);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 5000);

      // ===== TOKEN EXPIRY LOGIC =====
      // Check token expiry every 10 seconds
      const expiryCheck = setInterval(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          handleLogout();
          return;
        }

        // Decode JWT to get expiry time
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const expiryTime = payload.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          const timeRemaining = expiryTime - now;

          // Show warning when 30 seconds left
          if (timeRemaining > 0 && timeRemaining < 30000 && !showWarning) {
            setShowWarning(true);
          }

          // Show countdown
          if (timeRemaining > 0 && timeRemaining < 30000) {
            setTimeLeft(Math.ceil(timeRemaining / 1000));
          }

          // Auto logout when expired
          if (timeRemaining <= 0) {
            handleLogout();
          }
        } catch (err) {
          console.error("Error checking token:", err);
          handleLogout();
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(expiryCheck);
      };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowWarning(false);
    navigate("/login");
  };

  const handleStayLoggedIn = async () => {
    // Re-login to get a new token
    if (user) {
      try {
        // You'd need to store password or use a refresh token
        // For now, just show a message
        alert("Please log in again to refresh your session");
        handleLogout();
      } catch (error) {
        console.error("Error refreshing session:", error);
      }
    }
    setShowWarning(false);
  };

  return (
    <div className="dashboard-page">
      {/* ===== WARNING MODAL ===== */}
      {showWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Session Expiring Soon</h2>
            <p>Your session will expire in {timeLeft} seconds.</p>
            <p>Do you want to stay logged in?</p>
            <div className="modal-buttons">
              <button
                onClick={handleStayLoggedIn}
                className="btn-stay"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="btn-logout-modal"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DASHBOARD ===== */}
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        {user && <p>Welcome, {user.name}!</p>}
        
        <div className="data-cards">
          <div className="card">
            <h3>Temperature</h3>
            <p className="value">
              {temp !== null ? `${temp.toFixed(1)}°C` : "Loading..."}
            </p>
          </div>
          
          <div className="card">
            <h3>Humidity</h3>
            <p className="value">
              {humidity !== null ? `${humidity.toFixed(1)}%` : "Loading..."}
            </p>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
