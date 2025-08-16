"use client";

import { redirect, usePathname, useRouter } from "next/navigation";
import React from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { routes } from "@/config/routes";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Message } from "@/i18n/message";
import { Navbar } from "@/lib/component/navbar";
import { cls } from "@/lib/util/cls";
import { useAuthorization } from "@/store/slices/authorization-slice";

const messages = defineMessages({
  tabContests: {
    id: "app.root.(dashboard).layout.tab-contests",
    defaultMessage: "Contests",
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authorization = useAuthorization();
  const pathname = usePathname();
  const router = useRouter();

  function buildNavLink(label: Message, path: string) {
    const isActive = pathname.startsWith(path);
    return (
      <a
        key={path}
        className={cls("tab", isActive && "tab-active")}
        onClick={() => router.push(path)}
        data-testid={`link:${path}`}
      >
        <FormattedMessage {...label} />
      </a>
    );
  }

  function buildLinks() {
    return [buildNavLink(messages.tabContests, routes.ROOT_CONTESTS)];
  }

  if (!authorization) {
    return redirect(routes.ROOT_SIGN_IN);
  }
  if (authorization.member.type !== MemberType.ROOT) {
    return redirect(routes.FORBIDDEN);
  }

  return (
    <div>
      <Navbar signInPath={routes.ROOT_SIGN_IN} />
      <nav className="tabs tabs-lift w-full bg-base-100">
        {buildLinks()}
        <span className="grow border-b border-base-300" />
      </nav>
      <div className="p-10 bg-base-100">{children}</div>
    </div>
  );
}
