"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { SignInForm, SignInFormType } from "@/app/[slug]/sign-in/SignInForm";
import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
import { Page } from "@/app/_lib/component/page/Page";
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
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { SessionSlice } from "@/app/_lib/store/slice/SessionSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";

/**
 * SignInPage component allows members to sign in to a contest.
 */
export default function SignInPage() {
  const signInState = useLoadableState();
  const enterAsGuestState = useLoadableState();
  const contest = useAppSelector((state) => state.contest);
  const searchParams = useSearchParams();
  const toast = useToast();
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  const hasExpired = searchParams.get("expired");

  const form = useForm<SignInFormType>({
    resolver: joiResolver(SignInForm.schema),
    defaultValues: SignInForm.getDefault(),
  });

  useEffect(() => {
    if (hasExpired === "true") {
      toast.warning("Your session has expired.");
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
            message: "Wrong login or password",
          });
          form.setError("password", {
            type: "manual",
            message: "Wrong login or password",
          });
        },
        default: () => toast.error("Error signing in"),
      });
    }
  }

  async function enterAsGuest() {
    enterAsGuestState.start();
    try {
      if (!!session) {
        dispatch(SessionSlice.actions.clear());
        await Composition.sessionWritter.deleteCurrent();
      }
    } catch (error) {
      console.error(
        "Error deleting current session before entering as guest:",
        error,
      );
    }
    window.location.href = routes.CONTEST(contest.slug);
  }

  return (
    <Page title="Forseti - Sign In" description="Sign in to access the contest">
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
                <CardTitle data-testid="title">Sign In</CardTitle>
                <CardDescription data-testid="subtitle">
                  Sign in to access the contest
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="flex flex-col gap-4">
                <ControlledField
                  form={form}
                  name="login"
                  onChange={() => form.clearErrors()}
                  label="Login"
                  field={<Input data-testid="login" />}
                />
                <ControlledField
                  form={form}
                  name="password"
                  onChange={() => form.clearErrors()}
                  label="Password"
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
                  Sign In
                </AsyncButton>
                <AsyncButton
                  className="w-full"
                  type="button"
                  onClick={enterAsGuest}
                  variant="outline"
                  isLoading={enterAsGuestState.isLoading}
                  data-testid="enter-guest"
                >
                  Enter as Guest
                </AsyncButton>
              </CardFooter>
            </Card>
          </FieldSet>
        </Form>
      </div>
    </Page>
  );
}
