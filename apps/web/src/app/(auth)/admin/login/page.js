"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/login", { method: "POST", body: { email, password } });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h1 className="title">Admin Login</h1>
        <p className="subtitle">Review VA applications and verify candidates.</p>
        <form onSubmit={onSubmit}>
          <div className="label">Email</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <div className="label">Password</div>
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          {error ? (
            <div style={{ marginTop: 12 }} className="pill bad">
              {error}
            </div>
          ) : null}
          <div style={{ height: 14 }} />
          <button className="btn" disabled={loading} type="submit">
            {loading ? "Please wait…" : "Login"}
          </button>
        </form>
        <div style={{ height: 14 }} />
        <div className="muted">
          Admin is seeded from <span className="mono">SEED_ADMIN_EMAIL</span> / <span className="mono">SEED_ADMIN_PASSWORD</span>.
        </div>
      </div>
    </div>
  );
}

