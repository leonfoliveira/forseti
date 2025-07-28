import React from "react";
import { cls } from "@/app/_util/cls";
import { routes } from "@/config/routes";
import { useTranslations } from "next-intl";
import { redirect, RedirectType, usePathname } from "next/navigation";

export function RootTabBar() {
  const pathname = usePathname();
  const t = useTranslations("root._component.root-tab-bar");

  function buildNavLink(label: string, path: string) {
    const isActive = pathname.startsWith(path);
    return (
      <a
        key={path}
        className={cls("tab", isActive && "tab-active")}
        onClick={() => redirect(path, RedirectType.push)}
        data-testid={`link:${path}`}
      >
        {label}
      </a>
    );
  }

  function buildLinks() {
    return [buildNavLink(t("tab-contests"), routes.ROOT_CONTESTS)];
  }

  return (
    <nav className="tabs tabs-lift w-full bg-base-100">
      {buildLinks()}
      <span className="grow border-b border-base-300"></span>
    </nav>
  );
}
