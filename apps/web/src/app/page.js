import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="nav">
        <div className="navInner">
          <div className="brand">VA Marketplace</div>
          <div className="spacer" />
          <span className="pill">Pre-Verified VAs only</span>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ padding: 22 }}>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="pill">Pre‑Verified Marketplace</div>
              <div style={{ height: 10 }} />
              <h1 className="heroTitle">
                Hire <span className="gradientText">verified</span> virtual assistants in minutes.
              </h1>
              <p className="subtitle heroSub">
                A clean marketplace where VAs apply, get reviewed by admin, and only approved profiles appear in client matching.
                Built for speed, trust, and a premium hiring experience.
              </p>
              <div className="row">
                <Link className="btn primary" href="/client/signup">
                  Get started as Client
                </Link>
                <Link className="btn secondary" href="/va/signup">
                  Apply as VA
                </Link>
                <Link className="btn secondary" href="/admin/login">
                  Admin Login
                </Link>
              </div>
            </div>

            <div style={{ width: 420, maxWidth: "100%" }}>
              <div className="kpiGrid">
                <div className="kpi">
                  <div className="kpiNum">Verified only</div>
                  <div className="kpiLbl">Approved by admin</div>
                </div>
                <div className="kpi">
                  <div className="kpiNum">Fast matching</div>
                  <div className="kpiLbl">Skills + test score</div>
                </div>
                <div className="kpi">
                  <div className="kpiNum">Simple hiring</div>
                  <div className="kpiLbl">One click “Hire”</div>
                </div>
              </div>

              <div style={{ height: 12 }} />
              <div className="card" style={{ padding: 14 }}>
                <div className="muted" style={{ fontWeight: 700 }}>
                  Quick links
                </div>
                <div style={{ height: 10 }} />
                <div className="row">
                  <Link className="btn secondary" href="/client/login">
                    Client Login
                  </Link>
                  <Link className="btn secondary" href="/va/login">
                    VA Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div className="featureGrid">
          <div className="card">
            <div className="featureTitle">VA onboarding</div>
            <p className="featureText">Skills, experience, portfolio and test score — structured for fast review.</p>
          </div>
          <div className="card">
            <div className="featureTitle">Admin verification</div>
            <p className="featureText">Approve or reject applications with notes. Only approved VAs become visible.</p>
          </div>
          <div className="card">
            <div className="featureTitle">Client dashboard</div>
            <p className="featureText">Post jobs, generate a shortlist, and hire the best match — clean and minimal.</p>
          </div>
        </div>
      </div>
    </>
  );
}

