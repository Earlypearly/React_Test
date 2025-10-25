import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Use environment variable for backend URL
      const apiUrl = `${import.meta.env.VITE_API_URL}/aut`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Safely parse JSON
      let result: any = {};
      try {
        result = await response.json();
      } catch (jsonErr) {
        console.warn("Backend returned no JSON");
      }

      if (!response.ok) {
        setError(result.message || "Login failed");
        return;
      }

      // Success → redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error during login:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        {/* Error message */}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />

        <button type="submit">Login</button>

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
