import * as HeroUI from "@heroui/react";
import React from "react";

export type NavbarProps = React.ComponentProps<typeof HeroUI.Navbar>;

/**
 * Display a navbar component.
 */
export function Navbar(props: NavbarProps) {
  return <HeroUI.Navbar {...props} />;
}

export type NavbarBrandProps = React.ComponentProps<typeof HeroUI.NavbarBrand>;

/**
 * Display navbar brand section.
 */
Navbar.Brand = function NavbarBrand(props: NavbarBrandProps) {
  return <HeroUI.NavbarBrand {...props} />;
};

export type NavbarContentProps = React.ComponentProps<
  typeof HeroUI.NavbarContent
>;

/**
 * Display navbar content section.
 */
Navbar.Content = function NavbarContent(props: NavbarContentProps) {
  return <HeroUI.NavbarContent {...props} />;
};
