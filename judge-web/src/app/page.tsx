"use client";

import { Button } from "@/app/_component/form/button";
import { SubmitHandler, useForm } from "react-hook-form";
import React from "react";
import { useRouter } from "next/navigation";
import Joi from "joi";
import { NumberInput } from "@/app/_component/form/number-input";
import { joiResolver } from "@hookform/resolvers/joi";

type FormType = {
  contest: number;
};

const formSchema = Joi.object({
  contest: Joi.number().required().messages({
    "any.required": "Contest is required",
    "number.empty": "Contest is required",
  }),
});

export default function AppPage() {
  const appForm = useForm<FormType>({
    resolver: joiResolver(formSchema),
  });
  const router = useRouter();

  function makeOnSubmit(path: string) {
    function onSubmit(data: FormType) {
      router.push(path.replace("{id}", data.contest.toString()));
    }
    return onSubmit;
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <form
        className="bg-white p-10 w-full max-w-[400]"
        onSubmit={appForm.handleSubmit(makeOnSubmit("/contests/{id}"))}
      >
        <div className="my-6">
          <NumberInput fm={appForm} name="contest" label="Contest" />
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <Button
              onClick={appForm.handleSubmit(
                makeOnSubmit("/auth/contests/{id}"),
              )}
              className="flex-1 mr-5"
            >
              Sign In
            </Button>
            <Button
              onClick={appForm.handleSubmit(makeOnSubmit("/contests/{id}"))}
              className="flex-1"
            >
              Guest
            </Button>
          </div>
          <Button
            variant="outline-primary"
            onClick={() => router.push("/auth/root")}
            className="mt-5 flex-1"
          >
            Root
          </Button>
        </div>
      </form>
    </div>
  );
}
