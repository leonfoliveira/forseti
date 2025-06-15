import { redirect } from "next/navigation";
import { routes } from "@/app/_routes";

export default function RootPage() {
  return redirect(routes.ROOT_CONTESTS);
}
