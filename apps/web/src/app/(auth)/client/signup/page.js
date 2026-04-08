import Link from "next/link";
import AuthForm from "../../_components/AuthForm";

export default function ClientSignupPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h1 className="title">Create Client Account</h1>
        <p className="subtitle">Post jobs and hire pre-verified assistants.</p>
        <AuthForm mode="signup" role="CLIENT" redirectTo="/client" />
        <div style={{ height: 14 }} />
        <Link className="muted" href="/client/login">
          Already have an account? Login →
        </Link>
      </div>
    </div>
  );
}

