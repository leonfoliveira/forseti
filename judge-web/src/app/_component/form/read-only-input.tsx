import React from "react";
import { cls } from "@/app/_util/cls";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> & {
  containerClassName?: string;
  value: string;
  label: string;
  error?: string;
};

export function ReadOnlyInput({
  value,
  label,
  error,
  containerClassName,
  className,
  ...props
}: Props) {
  return (
    <div className={containerClassName}>
      <label className="block text-sm font-semibold">{label}</label>
      <input
        {...props}
        value={value}
        className={cls(
          "block w-full p-2 bg-gray-100 rounded-lg placeholder:text-gray-400 disabled:text-gray-300",
          className,
        )}
        readOnly
      />
      <p className="text-sm font-semibold text-red-500 min-h-[1em]">{error}</p>
    </div>
  );
}
