import { FormType } from "@/app/root/contests/_component/contest-form";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UploadAttachmentResponseDTO } from "@/core/repository/dto/response/UploadAttachmentResponseDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";

export function formatForm(contest: ContestResponseDTO): FormType {
  return {
    id: contest.id,
    title: contest.title,
    languages: contest.languages,
    startAt: new Date(contest.startAt),
    endAt: new Date(contest.endAt),
    members: contest.members.map((member) => ({
      _id: member.id,
      type: member.type,
      name: member.name,
      login: member.login,
    })),
    problems: contest.problems.map((problem) => ({
      _id: problem.id,
      title: problem.title,
      description: problem.description,
      timeLimit: problem.timeLimit,
      testCasesAttachment: problem.testCases,
    })),
  };
}

export async function formatContest(
  attachmentService: AttachmentService,
  contest: FormType,
): Promise<CreateContestRequestDTO | UpdateContestRequestDTO> {
  return {
    ...contest,
    members: contest.members.map(formatMember),
    problems: await Promise.all(
      contest.problems.map((it) => formatProblem(attachmentService, it)),
    ),
  };
}

function formatMember(
  member: FormType["members"][number],
): CreateContestRequestDTO["members"][number] &
  UpdateContestRequestDTO["members"][number] {
  return {
    ...member,
    password: member.password as string,
  };
}

async function formatProblem(
  attachmentService: AttachmentService,
  problem: FormType["problems"][number],
): Promise<
  CreateContestRequestDTO["problems"][number] &
    UpdateContestRequestDTO["problems"][number]
> {
  const testCase = (problem.testCases as File[])[0];
  const uploadAttachment = await uploadTestCase(attachmentService, testCase);
  return {
    ...problem,
    testCases: {
      filename: testCase.name,
      key: uploadAttachment.key,
    },
  };
}

async function uploadTestCase(
  attachmentService: AttachmentService,
  testCase: File,
): Promise<UploadAttachmentResponseDTO> {
  const uploadAttachment = await attachmentService.createUploadAttachment();
  await attachmentService.uploadAttachment(uploadAttachment.url, testCase);
  return uploadAttachment;
}
