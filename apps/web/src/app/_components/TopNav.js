"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function TopNav({ title, homeHref }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="nav">
      <div className="navInner">
        <Link className="brand" href={homeHref ?? "/"}>
          {title ?? "VA Marketplace"}
        </Link>
        <div className="spacer" />
        <span className="pill muted">{pathname}</span>
        <button className="btn secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

