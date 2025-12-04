"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { routes } from "@/config/routes";

/**
 * Handle forbidden errors on client-side rendering by redirecting to the 403 error page.
 */
export default function ForbiddenPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fromPath = pathname;
    router.push(`${routes.FORBIDDEN}?from=${encodeURIComponent(fromPath)}`);
  }, [router, pathname]);

  return null;
}
