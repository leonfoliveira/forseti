"use client";

import { useForm } from "react-hook-form";
import { MemberSignInForm } from "@/app/auth/_component/member-sign-in-form";
import { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { memberSignInFormSchema } from "@/app/auth/_form/sign-in-form-schema";
import { useFindContestByIdAction } from "@/app/_action/find-contest-by-id-action";
import { useMemberSignInAction } from "@/app/_action/sign-in-action-member";

type Props = {
  params: Promise<{
    id: number;
  }>;
};

export default function AuthMember({ params }: Props) {
  const { id } = use(params);
  const findContestByIdAction = useFindContestByIdAction();
  const memberSignInAction = useMemberSignInAction();

  const form = useForm<MemberSignInFormType>({
    resolver: joiResolver(memberSignInFormSchema),
  });

  useEffect(() => {
    findContestByIdAction.act(id);
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {findContestByIdAction.isLoading ? (
        <Spinner size="lg" />
      ) : (
        <MemberSignInForm
          contestTitle={findContestByIdAction.data?.title || ""}
          onSubmit={(data) => memberSignInAction.act(id, data)}
          form={form}
          isDisabled={memberSignInAction.isLoading}
          isLoading={memberSignInAction.isLoading}
        />
      )}
    </div>
  );
}
