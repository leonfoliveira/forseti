import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

/**
 * Handle forbidden errors on server-side rendering by redirecting to the 403 error page.
 */
export default async function ForbiddenPage() {
  const headersList = await headers();
  const referer = headersList.get("referer");
  const fromPath = referer ? new URL(referer).pathname : "/";

  return redirect(`${routes.FORBIDDEN}?from=${encodeURIComponent(fromPath)}`);
}
