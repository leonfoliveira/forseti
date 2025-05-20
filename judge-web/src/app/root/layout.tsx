"use client";

import React from "react";
import { Button } from "@/app/_component/form/button";
import { useContainer } from "@/app/_atom/container-atom";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { authorizationService } = useContainer();
  const router = useRouter();

  function signOut() {
    authorizationService.deleteAuthorization();
    router.push("/root/sign-in");
  }

  return (
    <div>
      <nav className="flex justify-end items-center bg-white p-2">
        <p className="mr-5">Root</p>
        <Button onClick={signOut} variant="outline-primary">
          Sign out
        </Button>
      </nav>
      {children}
    </div>
  );
}
