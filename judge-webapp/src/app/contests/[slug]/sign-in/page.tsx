"use client";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { MemberSignInFormType } from "@/app/contests/[slug]/sign-in/_form/member-sign-in-form";
import { memberSignInFormSchema } from "@/app/contests/[slug]/sign-in/_form/member-sign-in-form-schema";
import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { Button } from "@/lib/component/form/button";
import { Form } from "@/lib/component/form/form";
import { TextInput } from "@/lib/component/form/text-input";
import { useSetAuthorization } from "@/lib/provider/authorization-provider";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useAlert } from "@/store/slices/alerts-slice";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";

const messages = defineMessages({
  wrongLoginPassword: {
    defaultMessage: "Wrong login or password",
    id: "app.contests.[slug].sign-in.page.wrong-login-password",
  },
  signInError: {
    defaultMessage: "Error signing in",
    id: "app.contests.[slug].sign-in.page.sign-in-error",
  },
  title: {
    defaultMessage: "Sign In",
    id: "app.contests.[slug].sign-in.page.title",
  },
  login: {
    defaultMessage: "Login",
    id: "app.contests.[slug].sign-in.page.login",
  },
  password: {
    defaultMessage: "Password",
    id: "app.contests.[slug].sign-in.page.password",
  },
  signIn: {
    defaultMessage: "Sign In",
    id: "app.contests.[slug].sign-in.page.sign-in",
  },
});

/**
 * MemberSignInPage component allows members to sign in to a contest.
 */
export default function MemberSignInPage() {
  const signInState = useLoadableState();
  const contestMetadata = useContestMetadata();
  const { setAuthorization } = useSetAuthorization();
  const alert = useAlert();

  const router = useRouter();

  const form = useForm<MemberSignInFormType>({
    resolver: joiResolver(memberSignInFormSchema),
  });

  async function signIn(data: MemberSignInFormType) {
    signInState.start();
    try {
      const authorization = await authenticationService.authenticateMember(
        contestMetadata.id,
        data,
      );
      setAuthorization(authorization);
      signInState.finish();
      router.push(routes.CONTEST(contestMetadata.slug));
    } catch (error) {
      signInState.fail(error, {
        [UnauthorizedException.name]: () =>
          alert.warning(messages.wrongLoginPassword),
        default: () => alert.error(messages.signInError),
      });
    }
  }

  return (
    <div className="min-h-full flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit(signIn)}
        containerClassName="p-10 w-full max-w-[400] bg-base-100"
        disabled={signInState.isLoading}
        data-testid="form"
      >
        <h1 className="text-3xl font-bold" data-testid="title">
          <FormattedMessage {...messages.title} />
        </h1>
        <h2 className="text-md mt-2" data-testid="description">
          {contestMetadata?.title}
        </h2>
        <div className="my-6">
          <TextInput
            form={form}
            name="login"
            label={messages.login}
            data-testid="login"
          />
          <TextInput
            form={form}
            name="password"
            label={messages.password}
            password
            data-testid="password"
          />
        </div>
        <div className="flex flex-col">
          <Button
            type="submit"
            label={messages.signIn}
            rightIcon={
              <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
            }
            isLoading={signInState.isLoading}
            className="btn-primary w-full"
            data-testid="sign-in"
          />
        </div>
      </Form>
    </div>
  );
}
