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

export default function ClientDashboard() {
  const [me, setMe] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsCsv, setSkillsCsv] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const canCreate = useMemo(() => title.trim().length >= 3 && description.trim().length >= 20 && splitCsv(skillsCsv).length >= 1, [
    title,
    description,
    skillsCsv,
  ]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const meRes = await api("/auth/me");
      setMe(meRes.user);
      const { jobs } = await api("/jobs/mine");
      setJobs(jobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createJob() {
    setError(null);
    try {
      await api("/jobs/create", {
        method: "POST",
        body: {
          title,
          description,
          skills: splitCsv(skillsCsv),
        },
      });
      setTitle("");
      setDescription("");
      setSkillsCsv("");
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function generateWithAi() {
    setError(null);
    setAiLoading(true);
    try {
      const skills = splitCsv(skillsCsv);
      const data = await api("/ai/job", {
        method: "POST",
        body: { title, skills },
      });
      if (data?.description) setDescription(data.description);
      if (Array.isArray(data?.suggestedSkills) && data.suggestedSkills.length) {
        setSkillsCsv(Array.from(new Set([...skills, ...data.suggestedSkills])).join(", "));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function match(jobId) {
    setError(null);
    try {
      await api("/jobs/match", { method: "POST", body: { jobId } });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function hire(jobId, vaProfileId) {
    setError(null);
    try {
      await api("/hire", { method: "POST", body: { jobId, vaProfileId } });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <RequireRole role="CLIENT">
      <TopNav title="Client Dashboard" homeHref="/" />
      <div className="container">
        <div className="card">
          <div className="row">
            <div>
              <div className="muted">Signed in as</div>
              <div className="mono">{me?.email ?? "—"}</div>
            </div>
            <div className="spacer" />
            {me?.role ? <span className="pill">{me.role}</span> : null}
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div className="grid grid2">
          <div className="card">
            <h2 style={{ margin: 0 }}>Post a job</h2>
            <div className="label">Title</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Executive assistant for email + calendar" />
            <div className="label">Description</div>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe scope, hours, tools, timezone…" />
            <div className="label">Skills (comma separated)</div>
            <input className="input" value={skillsCsv} onChange={(e) => setSkillsCsv(e.target.value)} placeholder="e.g., Gmail, Google Calendar, Notion, Excel" />
            <div style={{ height: 12 }} />
            <div className="row">
              <button className="btn primary" onClick={createJob} disabled={!canCreate}>
                Create Job
              </button>
              <button className="btn secondary" onClick={generateWithAi} disabled={aiLoading || title.trim().length < 3 || splitCsv(skillsCsv).length < 1}>
                {aiLoading ? "Generating…" : "Generate with AI"}
              </button>
              <span className="pill">AI optional</span>
            </div>
          </div>

          <div className="card">
            <h2 style={{ margin: 0 }}>Your jobs</h2>
            <p className="subtitle" style={{ marginTop: 8 }}>
              Click “Match” to shortlist only verified VAs.
            </p>
            {loading ? <div className="muted">Loading…</div> : null}
            {error ? <div className="pill bad">{error}</div> : null}
            <div style={{ height: 10 }} />
            <div className="grid">
              {jobs.map((j) => (
                <div className="card hover" key={j.id} style={{ padding: 14 }}>
                  <div className="row">
                    <div style={{ fontWeight: 700 }}>{j.title}</div>
                    <div className="spacer" />
                    <span className="pill">{j.status}</span>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    Skills: {j.skills.map((s) => s.name).join(", ")}
                  </div>
                  <div style={{ height: 10 }} />
                  <div className="row">
                    <button className="btn secondary" onClick={() => match(j.id)}>
                      Match
                    </button>
                    {j.hire ? (
                      <span className="pill ok">Hired</span>
                    ) : (
                      <span className="pill pending">Open</span>
                    )}
                  </div>

                  {j.matches?.length ? (
                    <>
                      <div style={{ height: 12 }} />
                      <div className="muted" style={{ fontWeight: 600 }}>
                        Shortlisted (verified)
                      </div>
                      <div style={{ height: 8 }} />
                      <div className="grid">
                        {j.matches.slice(0, 5).map((m) => (
                          <div key={m.id} className="card hover" style={{ padding: 12 }}>
                            <div className="row">
                              <div style={{ fontWeight: 700 }}>
                                {m.vaProfile?.user?.email ?? "Verified VA"}
                              </div>
                              <div className="spacer" />
                              <span className="pill">score {m.score}</span>
                            </div>
                            <div className="divider" />
                            <div className="chipRow">
                              {(m.vaProfile?.skills ?? []).slice(0, 8).map((s) => (
                                <span className="chip" key={s.id ?? s.name}>
                                  {s.name}
                                </span>
                              ))}
                              {!m.vaProfile?.skills?.length ? <span className="muted">No skills</span> : null}
                            </div>
                            <div className="muted" style={{ marginTop: 6 }}>
                              Test score: {m.vaProfile?.application?.testScore ?? "—"}
                            </div>
                            <div className="muted" style={{ marginTop: 6 }}>
                              Portfolio:{" "}
                              {m.vaProfile?.portfolioLinks?.length
                                ? m.vaProfile.portfolioLinks.map((p) => p.url).join(", ")
                                : "—"}
                            </div>
                            <div style={{ height: 10 }} />
                            <button className="btn primary" disabled={Boolean(j.hire)} onClick={() => hire(j.id, m.vaProfileId)}>
                              Hire this VA
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
              {!jobs.length && !loading ? <div className="muted">No jobs yet.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

