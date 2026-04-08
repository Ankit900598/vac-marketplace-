"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "../_components/TopNav";
import RequireRole from "../_components/RequireRole";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [me, setMe] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState({});

  const pending = useMemo(() => apps.filter((a) => a.status === "PENDING"), [apps]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const meRes = await api("/auth/me");
      setMe(meRes.user);
      const { applications } = await api("/admin/applications");
      setApps(applications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function decide(vaProfileId, approve) {
    setError(null);
    try {
      await api("/admin/approve", {
        method: "POST",
        body: { vaProfileId, approve, note: note[vaProfileId] ?? "" },
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <RequireRole role="ADMIN">
      <TopNav title="Admin Dashboard" homeHref="/" />
      <div className="container">
        <div className="card">
          <div className="row">
            <div>
              <div className="muted">Signed in as</div>
              <div className="mono">{me?.email ?? "—"}</div>
            </div>
            <div className="spacer" />
            {me?.role ? <span className="pill">{me.role}</span> : null}
            <span className="pill pending">{pending.length} pending</span>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div className="card">
          <h2 style={{ margin: 0 }}>VA Applications</h2>
          <p className="subtitle" style={{ marginTop: 8 }}>
            Review onboarding, test score, portfolio. Approve to make VA visible to clients.
          </p>
          {loading ? <div className="muted">Loading…</div> : null}
          {error ? <div className="pill bad">{error}</div> : null}

          <div style={{ height: 12 }} />
          <div className="grid">
            {apps.map((a) => (
              <div className="card" key={a.id} style={{ padding: 14 }}>
                <div className="row">
                  <div style={{ fontWeight: 700 }}>{a.vaProfile?.user?.email ?? "VA"}</div>
                  <div className="spacer" />
                  <span className={`pill ${a.status === "APPROVED" ? "ok" : a.status === "PENDING" ? "pending" : "bad"}`}>{a.status}</span>
                  <span className="pill">score {a.testScore}</span>
                </div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Skills: {a.vaProfile?.skills?.map((s) => s.name).join(", ") || "—"}
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Portfolio:{" "}
                  {a.vaProfile?.portfolioLinks?.length
                    ? a.vaProfile.portfolioLinks.map((p) => p.url).join(", ")
                    : "—"}
                </div>
                <div style={{ height: 10 }} />
                <div className="muted" style={{ whiteSpace: "pre-wrap" }}>
                  {a.experience}
                </div>
                <div className="label">Review note (optional)</div>
                <input
                  className="input"
                  value={note[a.vaProfileId] ?? ""}
                  onChange={(e) => setNote((n) => ({ ...n, [a.vaProfileId]: e.target.value }))}
                  placeholder="Reason / feedback"
                />
                <div style={{ height: 12 }} />
                <div className="row">
                  <button className="btn" onClick={() => decide(a.vaProfileId, true)}>
                    Approve
                  </button>
                  <button className="btn danger" onClick={() => decide(a.vaProfileId, false)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {!apps.length && !loading ? <div className="muted">No applications yet.</div> : null}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

