import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchData = async () => {
      try {
        const response = await fetch("https://react-api-pink.vercel.app/api/temp");
        const data = await response.json();
        setTemp(data.temp);
        setHumidity(data.humidity);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
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
