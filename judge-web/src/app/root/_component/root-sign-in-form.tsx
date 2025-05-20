import { Input } from "@/app/_component/form/input";
import { Button } from "@/app/_component/form/button";
import { UseFormReturn } from "react-hook-form";

export type RootSignInFormType = {
  password: string;
};

type Props = {
  onSubmit: (data: RootSignInFormType) => Promise<void>;
  form: UseFormReturn<RootSignInFormType>;
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
