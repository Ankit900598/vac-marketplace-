import Link from "next/link";
import AuthForm from "../../_components/AuthForm";

export default function ClientLoginPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <div className="row">
          <div>
            <h1 className="title">Client Login</h1>
            <p className="subtitle">Access your dashboard and hire verified VAs.</p>
          </div>
        </div>
        <AuthForm mode="login" role="CLIENT" redirectTo="/client" />
        <div style={{ height: 14 }} />
        <Link className="muted" href="/client/signup">
          Need an account? Create one →
        </Link>
      </div>
    </div>
  );
}

