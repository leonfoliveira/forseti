"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { SignInForm, SignInFormType } from "@/app/[slug]/sign-in/sign-in-form";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { Form } from "@/app/_lib/component/form/form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_lib/component/shadcn/card";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
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
  enterGuestError: {
    id: "app.[slug].sign-in.page.enter-guest-error",
    defaultMessage: "Error entering as guest",
  },
  expiredSession: {
    id: "app.[slug].sign-in.page.expired-session",
    defaultMessage: "Your session has expired.",
  },
});

/**
 * SignInPage component allows members to sign in to a contest.
 */
export default function SignInPage() {
  const signInState = useLoadableState();
  const enterAsGuestState = useLoadableState();
  const contest = useAppSelector((state) => state.contest);
  const searchParams = useSearchParams();
  const toast = useToast();

  const hasExpired = searchParams.get("expired");

  const form = useForm<SignInFormType>({
    resolver: joiResolver(SignInForm.schema),
    defaultValues: SignInForm.getDefault(),
  });

  useEffect(() => {
    if (hasExpired === "true") {
      toast.warning(messages.expiredSession);
    }
  }, [hasExpired]);

  async function signIn(data: SignInFormType) {
    signInState.start();
    try {
      await Composition.authenticationWritter.authenticate(contest.id, data);
      window.location.href = routes.CONTEST(contest.slug);
    } catch (error) {
      await signInState.fail(error, {
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
    enterAsGuestState.start();
    try {
      await Composition.sessionWritter.deleteCurrent();
      window.location.href = routes.CONTEST(contest.slug);
    } catch (error) {
      await enterAsGuestState.fail(error, {
        default: () => toast.error(messages.enterGuestError),
      });
    }
  }

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <Form
          onSubmit={form.handleSubmit(signIn)}
          className="w-full max-w-md"
          data-testid="sign-in-form"
        >
          <FieldSet
            disabled={signInState.isLoading || enterAsGuestState.isLoading}
          >
            <Card>
              <CardHeader>
                <CardTitle data-testid="title">
                  <FormattedMessage {...messages.title} />
                </CardTitle>
                <CardDescription data-testid="subtitle">
                  <FormattedMessage {...messages.subtitle} />
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="flex flex-col gap-4">
                <ControlledField
                  form={form}
                  name="login"
                  onChange={() => form.clearErrors()}
                  label={messages.loginLabel}
                  field={<Input data-testid="login" />}
                />
                <ControlledField
                  form={form}
                  name="password"
                  onChange={() => form.clearErrors()}
                  label={messages.passwordLabel}
                  field={<Input type="password" data-testid="password" />}
                />
              </CardContent>
              <Separator />
              <CardFooter className="flex flex-col gap-2">
                <AsyncButton
                  type="submit"
                  className="w-full"
                  isLoading={signInState.isLoading}
                  data-testid="sign-in"
                >
                  <FormattedMessage {...messages.signIn} />
                </AsyncButton>
                <AsyncButton
                  className="w-full"
                  type="button"
                  onClick={enterAsGuest}
                  variant="outline"
                  isLoading={enterAsGuestState.isLoading}
                  data-testid="enter-guest"
                >
                  <FormattedMessage {...messages.enterGuestLabel} />
                </AsyncButton>
              </CardFooter>
            </Card>
          </FieldSet>
        </Form>
      </div>
    </Page>
  );
}
