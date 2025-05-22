"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useForm } from "react-hook-form";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { notFound, useRouter } from "next/navigation";
import { Authorization } from "@/core/domain/model/Authorization";
import { MemberSignInForm } from "@/app/auth/_component/member-sign-in-form";
import { use, useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { MemberSignInFormType } from "@/app/auth/_form/sign-in-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { memberSignInFormSchema } from "@/app/auth/_form/sign-in-form-schema";

type Props = {
  params: Promise<{
    id: number;
  }>;
};

export default function AuthMember({ params }: Props) {
  const { id } = use(params);
  const { authenticationService, contestService } = useContainer();
  const findContestFetcher = useFetcher<ContestShortResponseDTO>();
  const authenticateMemberFetcher = useFetcher<Authorization>();
  const toast = useToast();
  const router = useRouter();

  const form = useForm<MemberSignInFormType>({
    resolver: joiResolver(memberSignInFormSchema),
  });

  useEffect(() => {
    async function findContest() {
      await findContestFetcher.fetch(() => contestService.findContestById(id), {
        errors: {
          [NotFoundException.name]: () => notFound(),
        },
      });
    }
    findContest();
  }, []);

  async function signIn(form: MemberSignInFormType) {
    await authenticateMemberFetcher.fetch(
      () => authenticationService.authenticateMember(id, form),
      {
        errors: {
          [UnauthorizedException.name]: () => toast.warning("Invalid password"),
        },
      },
    );
    router.push(`/contests/${id}`);
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {findContestFetcher.isLoading ? (
        <Spinner size="lg" />
      ) : (
        <MemberSignInForm
          contestTitle={findContestFetcher.data?.title || ""}
          authenticateMemberFetcher={authenticateMemberFetcher}
          onSubmit={signIn}
          form={form}
          isDisabled={authenticateMemberFetcher.isLoading}
        />
      )}
    </div>
  );
}
