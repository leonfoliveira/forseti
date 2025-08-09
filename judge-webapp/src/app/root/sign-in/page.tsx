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
import { authenticationService } from "@/config/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useAuthorizationContext } from "@/app/_context/authorization-context";
import { useRouter } from "next/navigation";
import { useLoadableState } from "@/app/_util/loadable-state";
import { useAlert } from "@/app/_context/notification-context";
import { routes } from "@/config/routes";
import { RootSignInFormType } from "@/app/root/sign-in/_form/root-sign-in-form";

/**
 * RootSignInPage component is the sign-in page for root users.
 */
export default function RootSignInPage() {
  const signInState = useLoadableState();
  const { setAuthorization } = useAuthorizationContext();

  const router = useRouter();
  const alert = useAlert();
  const t = useTranslations("root.sign-in");
  const s = useTranslations("root.sign-in._form.root-sign-in-form");

  const form = useForm<RootSignInFormType>({
    resolver: joiResolver(rootSignInFormSchema),
  });

  async function signIn(data: RootSignInFormType) {
    signInState.start();
    try {
      const authorization = await authenticationService.authenticateRoot(data);
      signInState.finish(authorization);
      setAuthorization(authorization);
      router.push(routes.ROOT);
    } catch (error) {
      signInState.fail(error, {
        [UnauthorizedException.name]: () => alert.warning(t("unauthorized")),
        default: () => alert.error(t("error")),
      });
    }
  }

  return (
    <div className="min-h-full flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit(signIn)}
        disabled={signInState.isLoading}
        containerClassName="p-10 w-full max-w-[400] bg-base-100"
      >
        <h1 className="text-3xl font-bold" data-testid="title">
          {t("title")}
        </h1>
        <h2 className="text-md mt-2" data-testid="description">
          {t("description")}
        </h2>
        <div className="my-6">
          <TextInput
            form={form}
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
            className="btn-primary w-full"
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
