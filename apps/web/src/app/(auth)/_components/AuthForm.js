"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode, role, redirectTo }) {
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
      const path = mode === "signup" ? "/auth/signup" : "/auth/login";
      const body =
        mode === "signup" ? { email, password, role } : { email, password };
      await api(path, { method: "POST", body });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="label">Email</div>
      <input
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        type="email"
        required
      />
      <div className="label">Password</div>
      <input
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimum 8 characters"
        type="password"
        required
      />

      {error ? (
        <div style={{ marginTop: 12 }} className="pill bad">
          {error}
        </div>
      ) : null}

      <div style={{ height: 14 }} />
      <button className="btn" disabled={loading} type="submit">
        {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Login"}
      </button>
    </form>
  );
}

