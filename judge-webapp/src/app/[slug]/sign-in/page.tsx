"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
} from "@heroui/react";
import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

import { SignInFormType } from "@/app/[slug]/sign-in/_form/sign-in-form";
import { signInFormSchema } from "@/app/[slug]/sign-in/_form/sign-in-form-schema";
import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { defineMessages } from "@/i18n/message";
import { Form } from "@/lib/component/form/form";
import { FormField } from "@/lib/component/form/form-field";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { Metadata } from "@/lib/component/metadata";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useToast } from "@/lib/util/toast-hook";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

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
    defaultMessage: "Judge - Sign In",
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
  const dispatch = useAppDispatch();
  const toast = useToast();
  const router = useRouter();

  const form = useForm<SignInFormType>({
    resolver: joiResolver(signInFormSchema),
  });

  async function signIn(data: SignInFormType) {
    signInState.start();
    try {
      const authorization = await authenticationService.authenticate({
        contestId: contestMetadata.id,
        ...data,
      });
      dispatch(authorizationSlice.actions.set(authorization));
      signInState.finish();
      router.push(routes.CONTEST(contestMetadata.slug));
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

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="flex-1 flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <Form onSubmit={form.handleSubmit(signIn)}>
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex flex-col items-center text-center w-full">
                <h2
                  className="text-3xl font-bold text-primary"
                  data-testid="title"
                >
                  <FormattedMessage {...messages.title} />
                </h2>
                <p
                  className="text-default-500 text-sm mt-2"
                  data-testid="subtitle"
                >
                  <FormattedMessage {...messages.subtitle} />
                </p>
              </div>
            </CardHeader>
            <Divider className="my-2" />
            <CardBody className="gap-4 py-6 px-6">
              <FormField form={form} name="login">
                <Input
                  label={<FormattedMessage {...messages.loginLabel} />}
                  size="lg"
                  data-testid="login"
                />
              </FormField>
              <FormField form={form} name="password">
                <Input
                  label={<FormattedMessage {...messages.passwordLabel} />}
                  type="password"
                  size="lg"
                  data-testid="password"
                />
              </FormField>
            </CardBody>
            <Divider className="my-2" />
            <CardFooter className="flex-col gap-3 py-6 px-6">
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
                onPress={() =>
                  router.push(routes.CONTEST(contestMetadata.slug))
                }
                data-testid="enter-guest"
              >
                <FormattedMessage {...messages.enterGuestLabel} />
              </Button>
            </CardFooter>
          </Form>
        </Card>
      </div>
    </>
  );
}
