import { cls } from "@/lib/util/cls";

type Props = Omit<React.HTMLProps<HTMLSpanElement>, "size"> & {
  size?: string;
};

export function Label({ size = "md", children, ...props }: Props) {
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
