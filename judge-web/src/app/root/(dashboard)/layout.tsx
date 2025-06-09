"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/app/_component/form/button";
import { useTheme } from "@/app/_util/theme-hook";
import { useTranslations } from "next-intl";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, toggleTheme } = useTheme();
  const rootSignOutAction = useRootSignOutAction();
  const t = useTranslations("root");

  return (
    <div>
      <nav className="navbar bg-base-100" data-testid="navbar">
        <div className="navbar-end flex items-center">
          <label className="toggle text-base-content mr-5">
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === "dark"}
              onChange={toggleTheme}
              data-testid="navbar-theme"
            />
            <FontAwesomeIcon icon={faSun} size="xs" />
            <FontAwesomeIcon icon={faMoon} size="xs" />
          </label>
          <p className="mr-5" data-testid="navbar-member">
            Root
          </p>
          <Button
            onClick={() => rootSignOutAction.act()}
            className="btn-soft"
            data-testid="navbar-signout"
          >
            {t("sign-out:label")}
          </Button>
        </div>
      </nav>
      <div className="mt-5 p-10 bg-base-100">{children}</div>
    </div>
  );
}
