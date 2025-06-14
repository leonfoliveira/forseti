"use client";

import { useForm } from "react-hook-form";
import React from "react";
import { joiResolver } from "@hookform/resolvers/joi";
import { Form } from "@/app/_component/form/form";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import { MemberSignInFormType } from "@/app/contests/[slug]/sign-in/_form/member-sign-in-form-type";
import { memberSignInFormSchema } from "@/app/contests/[slug]/sign-in/_form/member-sign-in-form-schema";
import { authenticationService } from "@/app/_composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import { routes } from "@/app/_routes";
import { handleError } from "@/app/_util/error-handler";
import { useLoadableState } from "@/app/_util/loadable-state";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { useAlert } from "@/app/_component/context/notification-context";

export default function MemberSignInPage() {
  const signInState = useLoadableState();
  const contest = useContestMetadata();
  const { setAuthorization } = useAuthorization();
  const alert = useAlert();

  const router = useRouter();
  const t = useTranslations("contests.[slug].sign-in");
  const s = useTranslations(
    "contests.[slug].sign-in._form.sign-in-form-schema",
  );

  const form = useForm<MemberSignInFormType>({
    resolver: joiResolver(memberSignInFormSchema),
  });

  async function signIn(data: MemberSignInFormType) {
    try {
      const authorization = await authenticationService.authenticateMember(
        contest.id,
        data,
      );
      setAuthorization(authorization);
      router.push(routes.CONTEST(contest.slug));
    } catch (error) {
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
        className="p-10 w-full max-w-[400] bg-base-100"
        disabled={signInState.isLoading}
        data-testid="form"
      >
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <h2 className="text-md mt-2" data-testid="contest-title">
          {contest?.title}
        </h2>
        <div className="my-6">
          <TextInput
            fm={form}
            name="login"
            s={s}
            label={t("login:label")}
            data-testid="login"
          />
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
            isLoading={signInState.isLoading}
            className="btn-primary"
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
