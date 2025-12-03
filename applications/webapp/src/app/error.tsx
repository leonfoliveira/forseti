import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

/**
 * Handle internal server errors on server-side rendering by redirecting to the 500 error page.
 */
export default async function ServerErrorPage() {
  const headersList = await headers();
  const referer = headersList.get("referer");
  const fromPath = referer ? new URL(referer).pathname : "/";

  return redirect(
    `${routes.INTERNAL_SERVER_ERROR}?from=${encodeURIComponent(fromPath)}`,
  );
}
