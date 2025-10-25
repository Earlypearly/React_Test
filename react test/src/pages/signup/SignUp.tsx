import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SignUp.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nfcUid, setNfcUid] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nfcReading, setNfcReading] = useState(false);
  
  // Check if NFC is supported (removed setNfcSupported)
  const nfcSupported = "NDEFReader" in window || "NFC" in window;

  // NFC Reading Function
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

      ndef.onreading = (event: any) => {
        for (const record of event.message.records) {
          const uid = event.serialNumber || 
                      record.id || 
                      Array.from(new Uint8Array(record.data))
                        .map((x) => x.toString(16).padStart(2, "0"))
                        .join("");
          
          if (uid) {
            setNfcUid(uid.toUpperCase());
            setNfcReading(false);
            console.log("NFC UID read:", uid);
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
      const response = await fetch("https://react-api-pink.vercel.app/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          nfc_uid: nfcUid || null
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
      
      setName("");
      setEmail("");
      setPassword("");
      setNfcUid("");
      
    } catch (err) {
      console.error("Error during sign-up:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        
        {error && <p style={{ color: "#d32f2f" }}>{error}</p>}
        
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        {/* NFC Section */}
        {nfcSupported && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#fff5f0", borderRadius: "8px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#a17c4d", fontWeight: "600" }}>
              📱 NFC Card (Optional)
            </label>
            
            <input
              type="text"
              placeholder="NFC UID (auto-filled or manual)"
              value={nfcUid}
              onChange={(e) => setNfcUid(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "0.5rem",
                border: "1.5px solid #d0b38a",
                borderRadius: "8px",
                background: "#fffdf8"
              }}
            />
            
            <button
              type="button"
              onClick={handleNFCRead}
              disabled={loading || nfcReading}
              style={{
                width: "100%",
                background: nfcReading ? "#d0b38a" : "#b68f5e",
                color: "#fff",
                border: "none",
                padding: "0.75rem",
                borderRadius: "8px",
                cursor: nfcReading ? "wait" : "pointer",
                fontWeight: "600",
                transition: "background 0.3s"
              }}
            >
              {nfcReading ? "📡 Reading NFC..." : "📱 Read NFC Card"}
            </button>

            {nfcUid && (
              <p style={{ marginTop: "0.5rem", color: "#46a049", fontSize: "0.9rem" }}>
                ✅ NFC UID: {nfcUid}
              </p>
            )}
          </div>
        )}

        {!nfcSupported && (
          <p style={{ fontSize: "0.85rem", color: "#8b6a31", marginTop: "0.5rem" }}>
            ℹ️ NFC not supported on this device (Desktop/older phones)
          </p>
        )}
        
        <button type="submit" disabled={loading} style={{ marginTop: nfcSupported ? "1rem" : "0" }}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
