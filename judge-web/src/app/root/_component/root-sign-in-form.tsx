import { Input } from "@/app/_component/form/input";
import { Button } from "@/app/_component/form/button";
import { UseFormReturn } from "react-hook-form";

export type FormType = {
  password: string;
};

type Props = {
  onSubmit: (data: FormType) => Promise<void>;
  form: UseFormReturn<FormType>;
  isDisabled: boolean;
};

export function RootSignInForm(props: Props) {
  const { onSubmit, form, isDisabled } = props;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <h1>Sign In</h1>
      <Input
        type="text"
        label="password"
        disabled={isDisabled}
        {...form.register("password", { required: true })}
      />
      <Button type="submit">Sign in</Button>
    </form>
  );
}
