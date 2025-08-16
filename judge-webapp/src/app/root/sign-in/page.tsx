"use client";

import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { RootSignInFormType } from "@/app/root/sign-in/_form/root-sign-in-form";
import { rootSignInFormSchema } from "@/app/root/sign-in/_form/root-sign-in-form-schema";
import { authenticationService } from "@/config/composition";
import { routes } from "@/config/routes";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { Button } from "@/lib/component/form/button";
import { Form } from "@/lib/component/form/form";
import { TextInput } from "@/lib/component/form/text-input";
import { Metadata } from "@/lib/component/metadata";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useAlert } from "@/store/slices/alerts-slice";
import { authorizationSlice } from "@/store/slices/authorization-slice";
import { useAppDispatch } from "@/store/store";

const messages = defineMessages({
  pageTitle: {
    id: "app.root.sign-in.page.page-title",
    defaultMessage: "Judge - Root Sign In",
  },
  pageDescription: {
    id: "app.root.sign-in.page.page-description",
    defaultMessage: "Sign in as root to manage contests and users.",
  },
  wrongPassword: {
    id: "app.root.sign-in.page.wrong-password",
    defaultMessage: "Wrong password",
  },
  signInError: {
    id: "app.root.sign-in.page.sign-in-error",
    defaultMessage: "An error occurred while signing in",
  },
  title: {
    id: "app.root.sign-in.page.title",
    defaultMessage: "Sign In",
  },
  description: {
    id: "app.root.sign-in.page.description",
    defaultMessage: "Root",
  },
  password: {
    id: "app.root.sign-in.page.password",
    defaultMessage: "Password",
  },
  signIn: {
    id: "app.root.sign-in.page.sign-in",
    defaultMessage: "Sign In",
  },
});

/**
 * RootSignInPage component is the sign-in page for root users.
 */
export default function RootSignInPage() {
  const signInState = useLoadableState();
  const dispatch = useAppDispatch();

  const router = useRouter();
  const alert = useAlert();

  const form = useForm<RootSignInFormType>({
    resolver: joiResolver(rootSignInFormSchema),
  });

  async function signIn(data: RootSignInFormType) {
    signInState.start();
    try {
      const authorization = await authenticationService.authenticateRoot(data);
      signInState.finish(authorization);
      dispatch(authorizationSlice.actions.success(authorization));
      router.push(routes.ROOT);
    } catch (error) {
      signInState.fail(error, {
        [UnauthorizedException.name]: () =>
          alert.warning(messages.wrongPassword),
        default: () => alert.error(messages.signInError),
      });
    }
  }

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="min-h-full flex justify-center items-center">
        <Form
          onSubmit={form.handleSubmit(signIn)}
          disabled={signInState.isLoading}
          containerClassName="p-10 w-full max-w-[400] bg-base-100"
        >
          <div className="flex">
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={() => router.push(routes.HOME)}
              className="cursor-pointer text-2xl mt-1 mr-5"
              data-testid="back"
            />
            <h1 className="text-3xl font-bold" data-testid="title">
              <FormattedMessage {...messages.title} />
            </h1>
          </div>
          <h2 className="text-md mt-2" data-testid="description">
            <FormattedMessage {...messages.description} />
          </h2>
          <div className="my-6">
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
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-sm ms-2"
                />
              }
              className="btn-primary w-full"
              isLoading={signInState.isLoading}
              data-testid="sign-in"
            />
          </div>
        </Form>
      </div>
    </>
  );
}
