"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

/** Redirects anonymous visitors to /login, un-onboarded users to /onboarding, non-admins away from admin pages. */
export function useRequireAuth(options: { admin?: boolean; allowUnonboarded?: boolean } = {}) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
    else if (status === "authenticated" && user) {
      if (!user.onboarded && !options.allowUnonboarded) router.replace("/onboarding");
      else if (options.admin && user.role !== "admin") router.replace("/");
    }
  }, [status, user, router, options.admin, options.allowUnonboarded]);

  const ready = status === "authenticated" && !!user && (!options.admin || user.role === "admin");
  return { user, ready };
}
