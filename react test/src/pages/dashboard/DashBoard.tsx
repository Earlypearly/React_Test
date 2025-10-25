import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

const DashBoard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="card">
          <h2>Quick Stats</h2>
          <p>You've successfully logged in!</p>
        </div>

        <div className="card">
          <h2>Recent Activity</h2>
          <p>No recent activity to show.</p>
        </div>

        <div className="card">
          <h2>Your Profile</h2>
          <p>Email: user@example.com</p>
        </div>
      </main>
    </div>
  );
};

export default DashBoard;
