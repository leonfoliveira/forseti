import { cls } from "@/app/_lib/util/cls";

export type LabelProps = Omit<React.HTMLProps<HTMLSpanElement>, "size"> & {
  size?: string;
};

/**
 * A standard label component for form elements.
 */
export function Label({ size = "md", children, ...props }: LabelProps) {
  const textSize = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
  }[size];

  return (
    <span
      {...props}
      className={cls(
        textSize,
        "text-foreground font-semibold",
        props.className,
      )}
    >
      {children}
    </span>
  );
}
