import { Button } from "@/app/_component/form/button";
import { UseFormReturn } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@/app/_component/spinner";
import { Fetcher } from "@/app/_util/fetcher-hook";
import { Authorization } from "@/core/domain/model/Authorization";
import { TextInput } from "@/app/_component/form/text-input";
import { RootSignInFormType } from "@/app/auth/_form/sign-in-form-type";

type Props = {
  authenticateRootFetcher: Fetcher<Authorization>;
  onSubmit: (data: RootSignInFormType) => Promise<void>;
  form: UseFormReturn<RootSignInFormType>;
  isDisabled: boolean;
};

export function RootSignInForm(props: Props) {
  const { authenticateRootFetcher, onSubmit, form, isDisabled } = props;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-white p-10 w-full max-w-[400]"
    >
      <h1 className="text-3xl font-bold">Sign In</h1>
      <h2 className="text-md mt-2">Root</h2>
      <div className="my-6">
        <TextInput
          fm={form}
          name="password"
          label="Password"
          password
          disabled={isDisabled}
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
