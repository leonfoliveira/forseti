"use client";

import React, { use, useEffect } from "react";
import { containerAtom } from "@/app/_atom/container-atom";
import { useAtomValue, useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { addToastAtom, ToastLevel } from "@/app/_atom/toast-atom";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { notFound, useRouter } from "next/navigation";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { Authorization } from "@/core/domain/model/Authorization";

type FormType = {
  login: string;
  password: string;
};

function MemberAuthPage({ params }: { params: Promise<{ id: number }> }) {
  const { authenticationService, contestService } = useAtomValue(containerAtom);
  const addToast = useSetAtom(addToastAtom);
  const router = useRouter();
  const { id } = use(params);

  const contestFetcher = useFetcher<ContestResponseDTO>(null);
  const signInFetcher = useFetcher<Authorization>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>();

  useEffect(() => {
    async function fetchContest() {
      try {
        await contestFetcher.fetch(() => contestService.findContestById(id));
      } catch (error) {
        if (error instanceof NotFoundException) {
          notFound();
        } else {
          console.error(error);
          addToast(ToastLevel.ERROR, "An unexpected error occurred");
        }
      }
    }
    fetchContest().then();
  }, []);

  async function signIn(form: FormType) {
    try {
      await signInFetcher.fetch(() =>
        authenticationService.authenticateMember(id, form),
      );
      router.push("/root");
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        addToast(ToastLevel.WARNING, "Invalid login or password");
      } else {
        addToast(ToastLevel.ERROR, "An unexpected error occurred");
      }
    }
  }

  if (contestFetcher.isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h1 className="text-uppercase">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleSubmit(signIn)}>
        <h1 className="text-uppercase">{contestFetcher.data?.title}</h1>
        <div className="my-4">
          <div className="mb-2">
            <label htmlFor="password" className="form-label">
              Login
            </label>
            <input
              type="text"
              className="form-control"
              id="login"
              {...register("login", { required: "Login is required" })}
              disabled={signInFetcher.isLoading}
            />
            <div id="loginHelp" className="form-text text-danger">
              {errors.login?.message}
            </div>
          </div>
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              {...register("password", { required: "Password is required" })}
              disabled={signInFetcher.isLoading}
            />
            <div id="passwordHelp" className="form-text text-danger">
              {errors.password?.message}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary px-4"
          disabled={signInFetcher.isLoading}
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

export default MemberAuthPage;
