import React from "react";
import { cls } from "@/app/_util/cls";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
  label?: string;
  error?: string;
};

export function Input({
  className,
  containerClassName,
  label,
  error,
  ...props
}: Props) {
  return (
    <div className={containerClassName}>
      {label && <label className="block text-sm font-semibold">{label}</label>}
      <input
        {...props}
        className={cls(
          "block w-full p-2 bg-gray-100 rounded-lg disabled:text-gray-400",
          className,
        )}
      />
      <p className="text-sm font-semibold text-red-500 min-h-[1em]">{error}</p>
    </div>
  );
}
