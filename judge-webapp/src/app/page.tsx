"use client";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { Button } from "@/lib/component/form/button";
import { Form } from "@/lib/component/form/form";
import { TextInput } from "@/lib/component/form/text-input";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useAlert } from "@/store/slices/alerts-slice";

const messages = defineMessages({
  joinNotFound: {
    id: "app.page.join-not-found",
    defaultMessage: "Not found",
  },
  joinError: {
    id: "app.page.join-error",
    defaultMessage: "Could not check if contest exists",
  },
  slug: {
    id: "app.page.slug",
    defaultMessage: "Slug",
  },
  title: {
    id: "app.page.title",
    defaultMessage: "Judge",
  },
  join: {
    id: "app.page.join",
    defaultMessage: "Join",
  },
  enterRoot: {
    id: "app.page.enter-root",
    defaultMessage: "Enter as Root",
  },
  slugRequired: {
    id: "app.page.slug-required",
    defaultMessage: "Required",
  },
});

type FormType = {
  slug: string;
};

const formSchema = Joi.object({
  slug: Joi.string().required().messages({
    "string.empty": messages.slugRequired.id,
    "any.required": messages.slugRequired.id,
  }),
});

export default function HomePage() {
  const joinContestState = useLoadableState();
  const alert = useAlert();
  const router = useRouter();

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
        [NotFoundException.name]: () => alert.warning(messages.joinNotFound),
        default: () => alert.error(messages.joinError),
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
          <FormattedMessage {...messages.title} />
        </h1>
        <div className="my-6">
          <TextInput
            form={form}
            name="slug"
            label={messages.slug}
            data-testid="slug"
          />
        </div>
        <div className="flex flex-col">
          <Button
            type="submit"
            label={messages.join}
            rightIcon={
              <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
            }
            isLoading={joinContestState.isLoading}
            className="btn-primary w-full"
            data-testid="join"
          />
          <div className="divider" />
          <Button
            type="button"
            label={messages.enterRoot}
            rightIcon={
              <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
            }
            onClick={() => redirectRoot()}
            className="btn-outline btn-primary w-full"
            data-testid="root"
          />
        </div>
      </Form>
    </div>
  );
}
