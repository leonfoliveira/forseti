"use client";

import { useForm } from "react-hook-form";
import { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { memberSignInFormSchema } from "@/app/auth/_form/sign-in-form-schema";
import { useMemberSignInAction } from "@/app/_action/sign-in-action-member";
import { Form } from "@/app/_component/form/form";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useFindContestMetadataByIdAction } from "@/app/_action/find-contest-metadata-action";
import { useTranslations } from "next-intl";

type Props = {
  params: Promise<{
    id: number;
  }>;
};

export default function AuthMember({ params }: Props) {
  const { id } = use(params);
  const findContestSummaryByIdAction = useFindContestMetadataByIdAction();
  const memberSignInAction = useMemberSignInAction();
  const t = useTranslations("auth.contests");
  const s = useTranslations("auth._form.sign-in-form-schema");

  const form = useForm<MemberSignInFormType>({
    resolver: joiResolver(memberSignInFormSchema),
  });

  useEffect(() => {
    findContestSummaryByIdAction.act(id);
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {findContestSummaryByIdAction.isLoading ? (
        <Spinner size="lg" data-testid="contest-spinner" />
      ) : (
        <Form
          onSubmit={form.handleSubmit((data) =>
            memberSignInAction.act(id, data),
          )}
          className="p-10 w-full max-w-[400] bg-base-100"
          disabled={memberSignInAction.isLoading}
          data-testid="form"
        >
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <h2 className="text-md mt-2" data-testid="contest-title">
            {findContestSummaryByIdAction.data?.title}
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
      )}
    </div>
  );
}
