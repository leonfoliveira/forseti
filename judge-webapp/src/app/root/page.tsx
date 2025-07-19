import { redirect } from "next/navigation";
import { routes } from "@/routes";

export default function RootPage() {
  return redirect(routes.ROOT_CONTESTS);
}
