"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { redirect } from "next/navigation";

export default function RootContestsPage() {
  const { authorizationService } = useContainer();

  if (!authorizationService.isAuthorized()) {
    redirect("/root/sign-in");
  }

  return (
    <div>
      <h1>Contests</h1>
      <p>Welcome to the contests page!</p>
    </div>
  );
}
