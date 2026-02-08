import React from "react";

import { Button } from "@/app/_lib/component/shadcn/button";
import { Spinner } from "@/app/_lib/component/shadcn/spinner";

type Props = React.ComponentProps<typeof Button> & {
  isLoading?: boolean;
};

export function AsyncButton({ isLoading, children, ...props }: Props) {
  return (
    <Button {...props}>
      {children}
      {isLoading && <Spinner data-icon="inline-start" data-testid="spinner" />}
    </Button>
  );
}
