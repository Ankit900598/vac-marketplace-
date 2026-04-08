"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const loginForRole = {
  CLIENT: "/client/login",
  VA: "/va/login",
  ADMIN: "/admin/login",
};

export default function RequireRole({ role, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const me = await api("/auth/me");
        const authedRole = me?.user?.role;
        if (!authedRole) throw new Error("Unauthorized");
        if (role && authedRole !== role) {
          router.replace(loginForRole[role] ?? "/");
          return;
        }
        if (!cancelled) setReady(true);
      } catch {
        router.replace(loginForRole[role] ?? "/");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, role, pathname]);

  if (!ready) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="card">
          <div className="muted">Checking session…</div>
        </div>
      </div>
    );
  }

  return children;
}

