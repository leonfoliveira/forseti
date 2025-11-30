type Props = React.FormHTMLAttributes<HTMLFormElement>;

/**
 * A form component that wraps its children in a HTML form element.
 */
export function Form(props: Props) {
  return <form {...props} role="form" />;
}
