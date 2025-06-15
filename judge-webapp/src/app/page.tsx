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
import { routes } from "@/app/_routes";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useLoadableState } from "@/app/_util/loadable-state";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/context/notification-context";
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
  const { authorization, clearAuthorization } = useAuthorization();
  const joinContestState = useLoadableState();
  const router = useRouter();
  const alert = useAlert();
  const t = useTranslations("home-page");

  const form = useForm<FormType>({
    resolver: joiResolver(formSchema),
  });

  async function joinContest(data: FormType) {
    joinContestState.start();
    try {
      await contestService.findContestMetadataBySlug(data.slug);
      router.push(routes.CONTEST(data.slug));
      joinContestState.finish();
    } catch (error) {
      joinContestState.fail(error, {
        [NotFoundException.name]: () => alert.warning(t("not-found")),
        default: () => alert.error(t("error")),
      });
    }
  }

  function redirectRoot() {
    if (authorization?.member.type !== MemberType.ROOT) {
      clearAuthorization();
    }
    router.push(routes.ROOT);
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit(joinContest)}
        disabled={joinContestState.isLoading}
        className="p-10 w-full max-w-[400] bg-base-100"
        data-testid="form"
      >
        <h1 className="text-3xl font-bold">{t("title")}</h1>
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
            data-testid="sign-in"
          >
            {t("root:label")}
            <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
