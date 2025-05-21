import React, { DetailedHTMLProps, SelectHTMLAttributes } from "react";
import { cls } from "@/app/_util/cls";

type Props = DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  label?: string;
  error?: string;
};

export function Select({ children, className, ...props }: Props) {
  return (
    <div>
      {props.label && (
        <label className="block text-sm font-semibold">{props.label}</label>
      )}
      <select
        {...props}
        className={cls(
          "block w-full p-2 bg-gray-100 rounded-lg disabled:text-gray-400",
          className,
        )}
      >
        {children}
      </select>
      <p className="text-sm font-semibold text-red-500 min-h-[1em]">
        {props.error}
      </p>
    </div>
  );
}
