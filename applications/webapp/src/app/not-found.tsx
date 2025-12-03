import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

/**
 * Handle not found errors on server-side rendering by redirecting to the 404 error page.
 */
export default async function NotFoundPage() {
  const headersList = await headers();
  const referer = headersList.get("referer");
  const fromPath = referer ? new URL(referer).pathname : "/";

  return redirect(`${routes.NOT_FOUND}?from=${encodeURIComponent(fromPath)}`);
}
