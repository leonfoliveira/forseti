"use client";

import React from "react";
import { redirect } from "next/navigation";
import { useAuthorization } from "@/app/_context/authorization-context";
import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Navbar } from "@/app/_component/navbar";
import { RootTabBar } from "@/app/root/(dashboard)/_component/root-tab-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authorization = useAuthorization();

  if (!authorization) {
    return redirect(routes.ROOT_SIGN_IN);
  }
  if (authorization.member.type !== MemberType.ROOT) {
    return redirect(routes.FORBIDDEN);
  }

  return (
    <div>
      <Navbar signInPath={routes.ROOT_SIGN_IN} />
      <RootTabBar />
      <div className="p-10 bg-base-100">{children}</div>
    </div>
  );
}
