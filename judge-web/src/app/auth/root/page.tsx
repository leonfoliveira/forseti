"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useForm } from "react-hook-form";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import {
  RootSignInFormType,
  RootSignInForm,
} from "@/app/root/_component/root-sign-in-form";
import { Authorization } from "@/core/domain/model/Authorization";

export default function AuthRoot() {
  const { authenticationService } = useContainer();
  const toast = useToast();
  const authenticateRootFetcher = useFetcher<Authorization>();
  const router = useRouter();
  const form = useForm<RootSignInFormType>();

  async function signIn(form: RootSignInFormType) {
    try {
      await authenticateRootFetcher.fetch(() =>
        authenticationService.authenticateRoot(form),
      );
      router.push("/root");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        toast.warning("Invalid password");
      }
      throw error;
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <RootSignInForm
        authenticateRootFetcher={authenticateRootFetcher}
        onSubmit={signIn}
        form={form}
        isDisabled={authenticateRootFetcher.isLoading}
      />
    </div>
  );
}
