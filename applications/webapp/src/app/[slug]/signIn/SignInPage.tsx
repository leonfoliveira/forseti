import { joiResolver } from "@hookform/resolvers/joi";
import type { ParseKeys } from "i18next";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
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
import { SignInForm, SignInFormType } from "@/app/[slug]/signIn/SignInForm";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";

/**
 * SignInPage component allows members to sign in to a contest.
 */
export default function SignInPage() {
  const signInState = useLoadableState();
  const enterAsSpectatorState = useLoadableState();
  const contest = useAppSelector((state) => state.contest);
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const session = useAppSelector((state) => state.session);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const hasExpired = searchParams.get("expired");

  const form = useForm<SignInFormType>({
    resolver: joiResolver(SignInForm.schema),
    defaultValues: SignInForm.getDefault(),
  });

  useEffect(() => {
    if (hasExpired === "true") {
      toast.warning("[slug].signIn.SignInPage.sessionExpired");
    }
  }, [hasExpired]);

  async function signIn(data: SignInFormType) {
    signInState.start();
    try {
      const session = await Composition.authenticationWriter.authenticate(
        contest.id,
        data,
      );
      dispatch(SessionSlice.actions.set(session));
      navigate(routes.CONTEST(contest.slug));
    } catch (error) {
      await signInState.fail(error, {
        [UnauthorizedException.name]: () => {
          form.setError("login", {
            type: "manual",
            message:
              "[slug].signIn.SignInPage.wrongLoginOrPassword" as ParseKeys,
          });
          form.setError("password", {
            type: "manual",
            message:
              "[slug].signIn.SignInPage.wrongLoginOrPassword" as ParseKeys,
          });
        },
        default: () => toast.error("[slug].signIn.SignInPage.signInFailed"),
      });
    }
  }

  async function enterAsSpectator() {
    enterAsSpectatorState.start();
    try {
      if (!!session) {
        dispatch(SessionSlice.actions.clear());
        await Composition.sessionWriter.deleteCurrent();
      }
    } catch (error) {
      console.error(
        "Error deleting current session before entering as spectator:",
        error,
      );
    }
    navigate(routes.CONTEST(contest.slug));
  }

  return (
    <Page
      title="[slug].signIn.SignInPage.pageTitle"
      description="[slug].signIn.SignInPage.pageDescription"
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <Form
          onSubmit={form.handleSubmit(signIn)}
          className="w-full max-w-md"
          data-testid="sign-in-form"
        >
          <FieldSet
            disabled={signInState.isLoading || enterAsSpectatorState.isLoading}
          >
            <Card>
              <CardHeader>
                <CardTitle data-testid="title">
                  <FormattedMessage id="[slug].signIn.SignInPage.title" />
                </CardTitle>
                <CardDescription data-testid="subtitle">
                  <FormattedMessage id="[slug].signIn.SignInPage.subtitle" />
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="flex flex-col gap-4">
                <ControlledField
                  form={form}
                  name="login"
                  onChange={() => form.clearErrors()}
                  label="[slug].signIn.SignInPage.labelLogin"
                  field={<Input data-testid="login" />}
                />
                <ControlledField
                  form={form}
                  name="password"
                  onChange={() => form.clearErrors()}
                  label="[slug].signIn.SignInPage.labelPassword"
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
                  <FormattedMessage id="[slug].signIn.SignInPage.buttonSignIn" />
                </AsyncButton>
                {contest.settings.isSpectatorEnabled && (
                  <AsyncButton
                    className="w-full"
                    type="button"
                    onClick={enterAsSpectator}
                    variant="outline"
                    isLoading={enterAsSpectatorState.isLoading}
                    data-testid="enter-spectator"
                  >
                    <FormattedMessage id="[slug].signIn.SignInPage.buttonEnterAsSpectator" />
                  </AsyncButton>
                )}
              </CardFooter>
            </Card>
          </FieldSet>
        </Form>
      </div>
    </Page>
  );
}
