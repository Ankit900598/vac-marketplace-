import Link from "next/link";
import AuthForm from "../../_components/AuthForm";

export default function VaLoginPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h1 className="title">VA Login</h1>
        <p className="subtitle">Finish onboarding and get verified.</p>
        <AuthForm mode="login" role="VA" redirectTo="/va" />
        <div style={{ height: 14 }} />
        <Link className="muted" href="/va/signup">
          Need an account? Create one →
        </Link>
      </div>
    </div>
  );
}

