import React, { useState } from "react";
import { useRouter } from "next/router";

export default function WardenLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "same-origin",
      });

      const json = await res.json();

      if (res.ok && json.success) {
        router.push("/dashboard");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="warden-bg">
      <div className="warden-card">
        <img
          src="/logo.png"
          alt="Messy Matters"
          className="warden-logo"
        />

        <h2>
          Warden <span>Access</span>
        </h2>
        <p className="warden-sub">Authorized personnel only</p>

        <form onSubmit={submit} className="warden-form">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input"
          />

          {error && <div className="error-text">{error}</div>}

          <button
            className="submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Checking…" : "Login"}
          </button>

          <button
            type="button"
            className="btn alt full"
            onClick={() => router.push("/menu")}
          >
            ← Public View
          </button>
        </form>
      </div>
    </div>
  );
}
