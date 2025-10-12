type Props = React.FormHTMLAttributes<HTMLFormElement>;

export function Form(props: Props) {
  return <form {...props} role="form" />;
}
