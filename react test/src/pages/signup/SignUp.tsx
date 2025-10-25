// SignUp.tsx
import React, { useState } from "react";
import "./SignUp.css";

const SignUp = () => {
  const [name, setName] = useState("");      // ← Add name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://react-api-pink.vercel.app/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name,      // ← Send name
          email, 
          password 
        }),
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
        setError(result.message || "Sign-up failed");
        setLoading(false);
        return;
      }

      alert("Sign-up successful! You can now log in.");
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      
    } catch (err) {
      console.error("Error during sign-up:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <h1 style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "2rem", color: "#333" }}>
        [translate:Sign Up na Bisaya]
      </h1>
      
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
