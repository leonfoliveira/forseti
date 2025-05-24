"use client";

import { useForm } from "react-hook-form";
import { RootSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { rootSignInFormSchema } from "@/app/auth/_form/sign-in-form-schema";
import { useRootSignInAction } from "@/app/_action/sign-in-root-action";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "@/app/_component/spinner";
import { Form } from "@/app/_component/form/form";

export default function AuthRoot() {
  const signInAction = useRootSignInAction();

  const form = useForm<RootSignInFormType>({
    resolver: joiResolver(rootSignInFormSchema),
  });

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit(signInAction.act)}
        disabled={signInAction.isLoading}
        className="bg-white p-10 w-full max-w-[400]"
      >
        <h1 className="text-3xl font-bold">Sign In</h1>
        <h2 className="text-md mt-2">Root</h2>
        <div className="my-6">
          <TextInput fm={form} name="password" label="Password" password />
        </div>
        <div>
          <Button type="submit" className="mr-5">
            Sign in
            <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
          </Button>
          {signInAction.isLoading && <Spinner />}
        </div>
      </Form>
    </div>
  );
}
