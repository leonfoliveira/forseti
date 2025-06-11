"use client";

import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Form } from "@/app/_component/form/form";
import { useTranslations } from "next-intl";
import { rootSignInFormSchema } from "@/app/root/sign-in/_form/root-sign-in-form-schema";
import { RootSignInFormType } from "@/app/root/sign-in/_form/root-sign-in-form-type";
import { authenticationService } from "@/app/_composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useAuthorization } from "@/app/_context/authorization-context";
import { useRouter } from "next/navigation";
import { useAlert } from "@/app/_context/notification-context";
import { useLoadableState } from "@/app/_util/loadable-state";
import { handleError } from "@/app/_util/error-handler";

export default function RootSignInPage() {
  const signInState = useLoadableState();

  const { setAuthorization } = useAuthorization();
  const router = useRouter();
  const alert = useAlert();
  const t = useTranslations("root.sign-in");
  const s = useTranslations("root.sign-in._form.root-sign-in-form-schema");

  const form = useForm<RootSignInFormType>({
    resolver: joiResolver(rootSignInFormSchema),
  });

  async function signIn(data: RootSignInFormType) {
    signInState.start();
    try {
      const authorization = await authenticationService.authenticateRoot(data);
      signInState.finish(authorization);
      setAuthorization(authorization);
      router.push("/root");
    } catch (error) {
      signInState.fail(error);
      handleError(error, {
        [UnauthorizedException.name]: () => alert.warning(t("unauthorized")),
        default: () => alert.error(t("error")),
      });
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit(signIn)}
        disabled={signInState.isLoading}
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
            isLoading={signInState.isLoading}
            data-testid="sign-in"
          >
            {t("sign-in:label")}
            <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
