"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { routes } from "@/config/routes";

/**
 * Handle internal server errors on client-side rendering by redirecting to the 500 error page.
 */
export default function ServerErrorPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fromPath = pathname;
    router.push(
      `${routes.INTERNAL_SERVER_ERROR}?from=${encodeURIComponent(fromPath)}`,
    );
  }, [router, pathname]);

  return null;
}
