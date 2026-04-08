import Link from "next/link";
import AuthForm from "../../_components/AuthForm";

export default function VaSignupPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <h1 className="title">Create VA Account</h1>
        <p className="subtitle">Apply with skills, experience, portfolio and test score.</p>
        <AuthForm mode="signup" role="VA" redirectTo="/va" />
        <div style={{ height: 14 }} />
        <Link className="muted" href="/va/login">
          Already have an account? Login →
        </Link>
      </div>
    </div>
  );
}

