import {
  ContestForm,
  FormType,
} from "@/app/root/contests/_component/contest-form";
import { useContainer } from "@/app/_atom/container-atom";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { useForm } from "react-hook-form";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useToast } from "@/app/_util/toast-hook";
import { redirect, useRouter } from "next/navigation";
import { formatContest } from "@/app/root/contests/_util/contest-form-util";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";

export default function RootNewContestPage() {
  const { attachmentService, contestService } = useContainer();
  const toast = useToast();
  const createContestFetcher = useFetcher();
  const router = useRouter();

  const form = useForm<FormType>();

  async function createContest(data: FormType) {
    try {
      const inputDTO = await formatContest(attachmentService, data);
      const contest = (await createContestFetcher.fetch(() =>
        contestService.createContest(inputDTO as CreateContestRequestDTO),
      )) as ContestResponseDTO;
      toast.success("Contest created successfully");
      router.push(`/root/contests/${contest.id}`);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof Error) {
        redirect("/root/sign-in");
      } else {
        toast.error("Error creating contest");
      }
    }
  }

  return (
    <ContestForm
      onSubmit={createContest}
      form={form}
      isDisabled={createContestFetcher.isLoading}
    />
  );
}
