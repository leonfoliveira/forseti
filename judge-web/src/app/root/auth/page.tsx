"use client";

import React from "react";
import { containerAtom } from "@/app/_atom/container-atom";
import { useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import { ToastLevel } from "@/app/_atom/toast-atom";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRouter } from "next/navigation";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { Authorization } from "@/core/domain/model/Authorization";
import { useToast } from "@/app/_util/toast-hook";

type FormType = {
  password: string;
};

function RootAuthPage() {
  const { authenticationService } = useAtomValue(containerAtom);
  const toast = useToast();
  const router = useRouter();

  const authenticateRootFetcher = useFetcher<Authorization>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>();

  async function signIn(form: FormType) {
    try {
      await authenticateRootFetcher.fetch(() =>
        authenticationService.authenticateRoot(form),
      );
      router.push("/root");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        toast.warning("Invalid password");
      } else {
        toast.error();
      }
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleSubmit(signIn)}>
        <h1 className="text-uppercase">Root</h1>
        <div className="my-4">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            {...register("password", { required: "Password is required" })}
            disabled={authenticateRootFetcher.isLoading}
          />
          <div id="passwordHelp" className="form-text text-danger">
            {errors.password?.message}
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary px-4"
          disabled={authenticateRootFetcher.isLoading}
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

export default RootAuthPage;
