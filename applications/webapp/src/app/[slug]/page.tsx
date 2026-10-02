"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { routes } from "@/config/routes";

/**
 * Redirect to the contest leaderboard page.
 */
export default function ContestPage() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const slug = pathname.split("/")[1];
    router.replace(routes.CONTEST_LEADERBOARD(slug));
  }, [pathname, router]);

  return null;
}
