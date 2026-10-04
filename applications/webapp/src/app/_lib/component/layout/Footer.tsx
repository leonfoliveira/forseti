import { env } from "@/config/env";

/**
 * Footer component displayed at the bottom of the web application.
 * Includes a link to the Project GitHub repository and displays the current version.
 */
export function Footer() {
  return (
    <footer className="bg-card border-divider border-t py-1 text-center text-xs text-neutral-400">
      <p
        data-testid="footer-text"
        suppressHydrationWarning
      >{`Forseti ${env.version}`}</p>
    </footer>
  );
}
