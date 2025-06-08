"use client";

import { useForm } from "react-hook-form";
import { use, useEffect } from "react";
import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { memberSignInFormSchema } from "@/app/auth/_form/sign-in-form-schema";
import { useMemberSignInAction } from "@/app/_action/member-sign-in-action";
import { Form } from "@/app/_component/form/form";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useFindContestMetadataBySlugAction } from "@/app/_action/find-contest-metadata-by-slug-action";
import { useTranslations } from "next-intl";
import { LoadingPage } from "@/app/_component/loading-page";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ErrorPage } from "@/app/_component/error-page";
import { WaitPage } from "@/app/_component/wait-page";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default function AuthMember({ params }: Props) {
  const { slug } = use(params);
  const { data: metadata, ...findContestMetadataBySlugAction } =
    useFindContestMetadataBySlugAction();
  const memberSignInAction = useMemberSignInAction();
  const t = useTranslations("auth.contests");
  const s = useTranslations("auth._form.sign-in-form-schema");

  const form = useForm<MemberSignInFormType>({
    resolver: joiResolver(memberSignInFormSchema),
  });

  useEffect(() => {
    findContestMetadataBySlugAction.act(slug);
  }, []);

  if (findContestMetadataBySlugAction.isLoading) {
    return <LoadingPage />;
  }
  if (findContestMetadataBySlugAction.error) {
    return <ErrorPage />;
  }
  if (!metadata) return null;
  if (metadata.status === ContestStatus.NOT_STARTED) {
    return <WaitPage metadata={metadata} />;
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Form
        onSubmit={form.handleSubmit(
          (data) => metadata && memberSignInAction.act(metadata.id, data),
        )}
        className="p-10 w-full max-w-[400] bg-base-100"
        disabled={memberSignInAction.isLoading}
        data-testid="form"
      >
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <h2 className="text-md mt-2" data-testid="contest-title">
          {metadata?.title}
        </h2>
        <div className="my-6">
          <TextInput
            fm={form}
            name="login"
            s={s}
            label={t("login:label")}
            data-testid="login"
          />
          <TextInput
            fm={form}
            name="password"
            s={s}
            label={t("password:label")}
            password
            data-testid="password"
          />
        </div>
        <div className="flex flex-col">
          <Button
            type="submit"
            isLoading={memberSignInAction.isLoading}
            className="btn-primary"
            data-testid="signin"
          >
            {t("sign-in:label")}
            <FontAwesomeIcon icon={faChevronRight} className="text-sm ms-2" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
