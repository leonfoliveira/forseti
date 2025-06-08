"use client";

import { useForm } from "react-hook-form";
import { RootSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { rootSignInFormSchema } from "@/app/auth/_form/sign-in-form-schema";
import { useRootSignInAction } from "@/app/_action/root-sign-in-action";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Form } from "@/app/_component/form/form";
import { useTranslations } from "next-intl";

export default function AuthRoot() {
  const signInAction = useRootSignInAction();
  const t = useTranslations("auth.root");
  const s = useTranslations("auth._form.sign-in-form-schema");

  const form = useForm<RootSignInFormType>({
    resolver: joiResolver(rootSignInFormSchema),
  });

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit((data) => signInAction.act(data))}
        disabled={signInAction.isLoading}
        className="p-10 w-full max-w-[400] bg-base-100"
        data-testid="form"
      >
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <h2 className="text-md mt-2">{t("description")}</h2>
        <div className="my-6">
          <TextInput
            fm={form}
            name="password"
            s={s}
            label={t("password:label")}
            password
            data-testid="password"
          />
        </div>
        <div className="flex flex-col">
          <Button
            type="submit"
            className="btn-primary"
            isLoading={signInAction.isLoading}
            data-testid="signin"
          >
            {t("sign-in:label")}
            <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
