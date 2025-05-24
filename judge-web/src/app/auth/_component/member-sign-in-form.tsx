import { Button } from "@/app/_component/form/button";
import { UseFormReturn } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@/app/_component/spinner";
import { TextInput } from "@/app/_component/form/text-input";
import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { Form } from "@/app/_component/form/form";

type Props = {
  contestTitle: string;
  onSubmit: (data: MemberSignInFormType) => Promise<unknown>;
  form: UseFormReturn<MemberSignInFormType>;
  isDisabled: boolean;
  isLoading: boolean;
};

export function MemberSignInForm(props: Props) {
  const { contestTitle, onSubmit, form, isDisabled, isLoading } = props;

  return (
    <Form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-white p-10 w-full max-w-[400]"
      disabled={isDisabled}
    >
      <h1 className="text-3xl font-bold">Sign In</h1>
      <h2 className="text-md mt-2">{contestTitle}</h2>
      <div className="my-6">
        <TextInput fm={form} name="login" label="Login" />
        <TextInput fm={form} name="password" label="Password" password />
      </div>
      <div>
        <Button type="submit" className="mr-5">
          Sign in
          <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
        </Button>
        {isLoading && <Spinner />}
      </div>
    </Form>
  );
}
