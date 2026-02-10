import React from "react";

type Props = React.ComponentProps<"form">;

/**
 * A form component that wraps its children in a HTML form element.
 */
export function Form(props: Props) {
  return <form {...props} role="form" />;
}
