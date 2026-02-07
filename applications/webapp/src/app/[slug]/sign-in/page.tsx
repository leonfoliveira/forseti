"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";

import { SignInFormType } from "@/app/[slug]/sign-in/_form/sign-in-form";
import { signInFormSchema } from "@/app/[slug]/sign-in/_form/sign-in-form-schema";
import { Card } from "@/app/_lib/component/base/display/card";
import { Button } from "@/app/_lib/component/base/form/button";
import { Form } from "@/app/_lib/component/base/form/form";
import { Input } from "@/app/_lib/component/base/form/input";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { authenticationWritter, sessionWritter } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  wrongLoginPassword: {
    id: "app.[slug].sign-in.page.wrong-login-password",
    defaultMessage: "Wrong login or password",
  },
  signInError: {
    id: "app.[slug].sign-in.page.sign-in-error",
    defaultMessage: "Error signing in",
  },
  signIn: {
    id: "app.[slug].sign-in.page.sign-in",
    defaultMessage: "Sign in",
  },
  pageTitle: {
    id: "app.[slug].sign-in.page.page-title",
    defaultMessage: "Forseti - Sign In",
  },
  pageDescription: {
    id: "app.[slug].sign-in.page.page-description",
    defaultMessage: "Sign in to your account",
  },
  title: {
    id: "app.[slug].sign-in.page.title",
    defaultMessage: "Sign in",
  },
  subtitle: {
    id: "app.[slug].sign-in.page.subtitle",
    defaultMessage: "Enter your credentials to access the contest",
  },
  loginLabel: {
    id: "app.[slug].sign-in.page.login-label",
    defaultMessage: "Login",
  },
  passwordLabel: {
    id: "app.[slug].sign-in.page.password-label",
    defaultMessage: "Password",
  },
  signInLabel: {
    id: "app.[slug].sign-in.page.sign-in-label",
    defaultMessage: "Sign in",
  },
  enterGuestLabel: {
    id: "app.[slug].sign-in.page.enter-guest-label",
    defaultMessage: "Enter as Guest",
  },
});

/**
 * SignInPage component allows members to sign in to a contest.
 */
export default function SignInPage() {
  const signInState = useLoadableState();
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const toast = useToast();

  const form = useForm<SignInFormType>({
    resolver: joiResolver(signInFormSchema),
  });

  async function signIn(data: SignInFormType) {
    signInState.start();
    try {
      await authenticationWritter.authenticate(contestMetadata.id, data);
      window.location.href = routes.CONTEST(contestMetadata.slug);
    } catch (error) {
      signInState.fail(error, {
        [UnauthorizedException.name]: () => {
          form.setError("login", {
            type: "manual",
            message: messages.wrongLoginPassword.id,
          });
          form.setError("password", {
            type: "manual",
            message: messages.wrongLoginPassword.id,
          });
        },
        default: () => toast.error(messages.signInError),
      });
    }
  }

  async function enterAsGuest() {
    await sessionWritter.deleteCurrent();
    window.location.href = routes.CONTEST(contestMetadata.slug);
  }

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Form onSubmit={form.handleSubmit(signIn)}>
            <Card.Header className="px-6 pt-6 pb-4">
              <div className="flex w-full flex-col items-center text-center">
                <h2
                  className="text-primary text-3xl font-bold"
                  data-testid="title"
                >
                  <FormattedMessage {...messages.title} />
                </h2>
                <p
                  className="text-default-500 mt-2 text-sm"
                  data-testid="subtitle"
                >
                  <FormattedMessage {...messages.subtitle} />
                </p>
              </div>
            </Card.Header>
            <Divider className="my-2" />
            <Card.Body className="gap-4 px-6 py-6">
              <Form.Field
                form={form}
                name="login"
                onChange={() => form.clearErrors()}
              >
                <Input
                  label={<FormattedMessage {...messages.loginLabel} />}
                  size="lg"
                  data-testid="login"
                />
              </Form.Field>
              <Form.Field
                form={form}
                name="password"
                onChange={() => form.clearErrors()}
              >
                <Input
                  label={<FormattedMessage {...messages.passwordLabel} />}
                  type="password"
                  size="lg"
                  data-testid="password"
                />
              </Form.Field>
            </Card.Body>
            <Divider className="my-2" />
            <Card.Footer className="flex-col gap-3 px-6 py-6">
              <Button
                color="primary"
                type="submit"
                isLoading={signInState.isLoading}
                size="lg"
                fullWidth
                data-testid="sign-in"
              >
                <FormattedMessage {...messages.signIn} />
              </Button>
              <Button
                color="primary"
                variant="bordered"
                size="lg"
                fullWidth
                onPress={enterAsGuest}
                data-testid="enter-guest"
              >
                <FormattedMessage {...messages.enterGuestLabel} />
              </Button>
            </Card.Footer>
          </Form>
        </Card>
      </div>
    </>
  );
}
