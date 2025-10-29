import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nfcReading, setNfcReading] = useState(false);
  const navigate = useNavigate();

  const nfcSupported = "NDEFReader" in window || "NFC" in window;

  const handleNFCRead = async () => {
    if (!("NDEFReader" in window)) {
      setError("NFC is not supported on this device");
      return;
    }

    setNfcReading(true);
    setError("");

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.onreading = async (event: any) => {
        for (const record of event.message.records) {
          const uid =
            event.serialNumber ||
            record.id ||
            Array.from(new Uint8Array(record.data))
              .map((x) => x.toString(16).padStart(2, "0"))
              .join("");

          if (uid) {
            const nfcUid = uid.toUpperCase();
            console.log("NFC UID read:", nfcUid);

            try {
              const response = await fetch(
                "https://react-test-i1mf.onrender.com/api/nfc-lookup",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nfc_uid: nfcUid }),
                }
              );

              const result = await response.json();

              if (response.ok) {
                setEmail(result.email);
                setError("");
                console.log(`Welcome ${result.name}! Please enter your password.`);
              } else {
                setError(result.message || "NFC card not found");
              }
            } catch (err) {
              console.error("Error looking up NFC:", err);
              setError("Error reading NFC card");
            }

            setNfcReading(false);
            break;
          }
        }
      };

      ndef.onreadingerror = () => {
        setError("Unable to read NFC card. Try again.");
        setNfcReading(false);
      };
    } catch (err: any) {
      setError(`NFC Error: ${err.message}`);
      setNfcReading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://react-test-i1mf.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || `Error: ${response.status}`);
        setLoading(false);
        return;
      }

      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        console.log("Login successful with JWT token:", result.token);
        navigate("/dashboard");
      } else {
        console.error("No token received from server");
        setError("Login failed: No token received from server.");
      }
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
        {error && <p className="error-message">{error}</p>}

        {nfcSupported && (
          <div className="nfc-section">
            <button
              type="button"
              onClick={handleNFCRead}
              disabled={loading || nfcReading}
              className="nfc-button"
            >
              {nfcReading ? "📡 Scanning NFC Card..." : "📱 Scan NFC Card"}
            </button>
            <p className="nfc-hint">Tap your NFC card to auto-fill email</p>
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="input-field"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="input-field"
        />

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
