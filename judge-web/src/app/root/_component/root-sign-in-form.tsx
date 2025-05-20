import { Input } from "@/app/_component/form/input";
import { Button } from "@/app/_component/form/button";
import { UseFormReturn } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@/app/_component/spinner";
import { Fetcher } from "@/app/_util/fetcher-hook";
import { Authorization } from "@/core/domain/model/Authorization";

export type RootSignInFormType = {
  password: string;
};

type Props = {
  authenticateRootFetcher: Fetcher<Authorization>;
  onSubmit: (data: RootSignInFormType) => Promise<void>;
  form: UseFormReturn<RootSignInFormType>;
  isDisabled: boolean;
};

export function RootSignInForm(props: Props) {
  const { authenticateRootFetcher, onSubmit, form, isDisabled } = props;
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-white p-10 w-full max-w-[400]"
    >
      <h1 className="text-2xl font-bold">Sign In</h1>
      <h2 className="text-lg">Root</h2>
      <div className="my-8">
        <Input
          type="password"
          label="Password"
          disabled={isDisabled}
          {...form.register("password", { required: "Password is required" })}
          error={errors.password?.message}
        />
      </div>
      <div>
        <Button type="submit" disabled={isDisabled} className="mr-5">
          Sign in
          <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
        </Button>
        {authenticateRootFetcher.isLoading && <Spinner />}
      </div>
    </form>
  );
}
