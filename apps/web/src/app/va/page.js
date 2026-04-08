"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "../_components/TopNav";
import RequireRole from "../_components/RequireRole";
import { api } from "@/lib/api";

function splitCsv(s) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeUrl(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const withScheme = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    return u.toString();
  } catch {
    return null;
  }
}

function formatZodDetails(details) {
  const fieldErrors = details?.fieldErrors;
  if (!fieldErrors) return null;
  const lines = Object.entries(fieldErrors)
    .flatMap(([field, errs]) => (errs ?? []).map((e) => `${field}: ${e}`))
    .filter(Boolean);
  return lines.length ? lines.join(" | ") : null;
}

export default function VaDashboard() {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const [experience, setExperience] = useState("");
  const [testScore, setTestScore] = useState(0);
  const [skillsCsv, setSkillsCsv] = useState("");
  const [portfolioCsv, setPortfolioCsv] = useState("");

  const canApply = useMemo(() => experience.trim().length >= 20 && splitCsv(skillsCsv).length >= 1, [experience, skillsCsv]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const meRes = await api("/auth/me");
      setMe(meRes.user);
      const { vaProfile } = await api("/va/me");
      setProfile(vaProfile);
      setExperience(vaProfile.application?.experience ?? "");
      setTestScore(vaProfile.application?.testScore ?? 0);
      setSkillsCsv(vaProfile.skills?.map((s) => s.name).join(", ") ?? "");
      setPortfolioCsv(vaProfile.portfolioLinks?.map((p) => p.url).join(", ") ?? "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit() {
    setError(null);
    setWarning(null);
    try {
      const skills = splitCsv(skillsCsv);
      const portfolioLinks = splitCsv(portfolioCsv)
        .map(normalizeUrl)
        .filter(Boolean)
        .map((url) => ({ url }));

      const invalidCount = splitCsv(portfolioCsv).length - portfolioLinks.length;
      if (invalidCount > 0) {
        setWarning(`Ignored ${invalidCount} invalid portfolio link(s). Use full URLs like https://example.com`);
      }

      await api("/va/apply", {
        method: "POST",
        body: {
          experience,
          testScore: Number(testScore),
          skills,
          portfolioLinks,
        },
      });
      await refresh();
    } catch (err) {
      const detailsMsg = formatZodDetails(err.details);
      setError(detailsMsg ? `${err.message}: ${detailsMsg}` : err.message);
    }
  }

  const status = profile?.application?.status ?? "NOT_APPLIED";

  return (
    <RequireRole role="VA">
      <TopNav title="VA Dashboard" homeHref="/" />
      <div className="container">
        <div className="card">
          <div className="row">
            <div>
              <div className="muted">Signed in as</div>
              <div className="mono">{me?.email ?? "—"}</div>
            </div>
            <div className="spacer" />
            <span className={`pill ${status === "APPROVED" ? "ok" : status === "PENDING" ? "pending" : status === "REJECTED" ? "bad" : ""}`}>
              {status}
            </span>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div className="card">
          <h2 style={{ margin: 0 }}>Onboarding</h2>
          <p className="subtitle" style={{ marginTop: 8 }}>
            Fill this once. Admin will verify your profile. Only approved VAs are shown to clients.
          </p>
          {loading ? <div className="muted">Loading…</div> : null}
          {error ? <div className="pill bad">{error}</div> : null}
          {warning ? <div className="pill pending">{warning}</div> : null}

          <div className="label">Skills (comma separated)</div>
          <input className="input" value={skillsCsv} onChange={(e) => setSkillsCsv(e.target.value)} placeholder="e.g., Customer support, Notion, Excel" />

          <div className="label">Experience</div>
          <textarea className="textarea" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Describe your experience, niches, tools, results…" />

          <div className="label">Portfolio links (comma separated URLs)</div>
          <input className="input" value={portfolioCsv} onChange={(e) => setPortfolioCsv(e.target.value)} placeholder="https://..., https://..." />

          <div className="label">Test score (0–100)</div>
          <input className="input" value={testScore} onChange={(e) => setTestScore(e.target.value)} type="number" min={0} max={100} />

          <div style={{ height: 12 }} />
          <button className="btn" onClick={submit} disabled={!canApply}>
            Submit for verification
          </button>
        </div>
      </div>
    </RequireRole>
  );
}

