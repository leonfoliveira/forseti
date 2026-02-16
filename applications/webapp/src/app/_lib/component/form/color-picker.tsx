import { PaletteIcon } from "lucide-react";
import React, { useRef } from "react";

import { Button } from "@/app/_lib/component/shadcn/button";

type Props = React.ComponentProps<"input">;

export function ColorPicker({ onChange, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    changeTimeoutRef.current = setTimeout(() => {
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value },
          currentTarget: { ...e.currentTarget, value },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }, 50);
  };

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        variant="ghost"
        className="relative overflow-hidden"
      >
        <input
          type="color"
          ref={inputRef}
          className="absolute inset-0 h-full w-full border-0 opacity-0 outline-0"
          {...props}
          onChange={handleChange}
          data-testid="color-input"
        />
        <PaletteIcon className="pointer-events-none relative z-10" />
      </Button>
    </div>
  );
}
