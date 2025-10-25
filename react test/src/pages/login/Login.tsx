// Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Updated API URL - fixed the missing slashes and using your new API
      const response = await fetch("https://react-api-pink.vercel.app/api/login/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let result: any = {};
      try {
        result = await response.json();
      } catch (jsonError) {
        console.warn("Backend returned no JSON:", jsonError);
        setError("Invalid response from server");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(result.message || `Error: ${response.status}`);
        setLoading(false);
        return;
      }

      // Store user data if needed
      localStorage.setItem("user", JSON.stringify(result.user));
      navigate("/dashboard");
      
      console.log("Login successful:", result);
      
      // Success → redirect
      navigate("/dashboard");
      
    } catch (err) {
      console.error("Error during login:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
