import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Hardcoded credentials (for now - replace with real auth later)
  const VALID_EMAIL = "Earl@gmail.com";
  const VALID_PASSWORD = "Earl123";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Check credentials
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      // Success - redirect to dashboard
      navigate("/dashboard");
    } else {
      // Failed - show error
      setError("Invalid email or password");
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
          onChange={e => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>

        {/* Sign Up prompt */}
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
