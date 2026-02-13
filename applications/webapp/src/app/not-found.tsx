"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { routes } from "@/config/routes";

/**
 * Handle not found errors on client-side rendering by redirecting to the 404 error page.
 */
export default function NotFoundPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fromPath = pathname;
    router.replace(`${routes.NOT_FOUND}?from=${encodeURIComponent(fromPath)}`);
  }, [router, pathname]);

  return null;
}
