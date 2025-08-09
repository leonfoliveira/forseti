"use client";

import { Form } from "@/app/_component/form/form";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Joi from "joi";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useLoadableState } from "@/app/_util/loadable-state";
import { contestService } from "@/config/composition";
import { useAlert } from "@/app/_context/notification-context";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";

type FormType = {
  slug: string;
};

const formSchema = Joi.object({
  slug: Joi.string().required().messages({
    "string.empty": "slug:required",
    "any.required": "slug:required",
  }),
});

export default function HomePage() {
  const joinContestState = useLoadableState();
  const alert = useAlert();
  const router = useRouter();
  const t = useTranslations("home-page");

  const form = useForm<FormType>({
    resolver: joiResolver(formSchema),
  });

  async function joinContest(data: FormType) {
    joinContestState.start();
    try {
      await contestService.findContestMetadataBySlug(data.slug);
      joinContestState.finish();
      router.push(routes.CONTEST_SIGN_IN(data.slug));
    } catch (error) {
      joinContestState.fail(error, {
        [NotFoundException.name]: () => alert.warning(t("not-found")),
        default: () => alert.error(t("error")),
      });
    }
  }

  function redirectRoot() {
    router.push(routes.ROOT_SIGN_IN);
  }

  return (
    <div className="min-h-full flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit(joinContest)}
        disabled={joinContestState.isLoading}
        containerClassName="p-10 w-full max-w-[400] bg-base-100"
      >
        <h1 className="text-3xl font-bold" data-testid="title">
          {t("title")}
        </h1>
        <div className="my-6">
          <TextInput
            form={form}
            name="slug"
            s={t}
            label={t("slug:label")}
            data-testid="slug"
          />
        </div>
        <div className="flex flex-col">
          <Button
            type="submit"
            isLoading={joinContestState.isLoading}
            className="btn-primary w-full"
            data-testid="join"
          >
            {t("join:label")}
            <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
          </Button>
          <div className="divider" />
          <Button
            type="button"
            onClick={() => redirectRoot()}
            className="btn-outline btn-primary w-full"
            data-testid="root"
          >
            {t("root:label")}
            <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
