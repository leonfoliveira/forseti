import { Router } from "./Router";
import { Toaster } from "@/app/_lib/component/shadcn/sonner";
import { TooltipProvider } from "@/app/_lib/component/shadcn/tooltip";
import { ThemeProvider } from "@/app/_lib/provider/ThemeProvider";

export function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  );
}
