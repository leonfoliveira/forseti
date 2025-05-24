import React, { DetailedHTMLProps, FormHTMLAttributes } from "react";

type Props = DetailedHTMLProps<
  FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> & {
  children: React.ReactNode;
  disabled?: boolean;
};

export function Form({ children, disabled = false, ...props }: Props) {
  return (
    <form {...props}>
      {React.Children.map(
        children,
        function updateChildren(child: React.ReactNode): React.ReactNode {
          if (React.isValidElement<Record<string, unknown>>(child)) {
            return React.cloneElement(
              child as React.ReactElement<{
                disabled?: boolean;
                children?: React.ReactNode;
              }>,
              {
                disabled: ("disabled" in child.props
                  ? child.props.disabled
                  : disabled) as boolean,
                children: React.Children.map(
                  child.props.children as React.ReactNode,
                  updateChildren,
                ),
              },
            );
          }
          return child;
        },
      )}
    </form>
  );
}
