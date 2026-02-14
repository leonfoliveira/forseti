import React from "react";

import { Button } from "@/app/_lib/component/shadcn/button";
import { Spinner } from "@/app/_lib/component/shadcn/spinner";

type Props = React.ComponentProps<typeof Button> & {
  icon?: React.ReactNode;
  isLoading?: boolean;
};

/**
 * Displays a button with a loading state. When `isLoading` is true, it shows a spinner and disables the button.
 */
export function AsyncButton({ icon, isLoading, children, ...props }: Props) {
  return (
    <Button {...props} disabled={isLoading}>
      {children}
      {icon && !isLoading && icon}
      {isLoading && <Spinner data-icon="inline-start" data-testid="spinner" />}
    </Button>
  );
}
