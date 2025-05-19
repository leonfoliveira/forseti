import { AttachmentService } from "@/core/service/AttachmentService";
import { ContestFormType } from "@/app/root/contests/_component/contest-form";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";

export async function toCreateContestRequestDTO(
  attachmentService: AttachmentService,
  form: ContestFormType,
): Promise<CreateContestRequestDTO> {
  const update = await toUpdateRequestDTO(attachmentService, form);
  return update as CreateContestRequestDTO;
}

export async function toUpdateRequestDTO(
  attachmentService: AttachmentService,
  form: ContestFormType,
): Promise<UpdateContestRequestDTO> {
  function mapMember(member: ContestFormType["members"][number]) {
    return {
      id: member._id,
      type: member.type,
      name: member.name,
      login: member.login,
      password: member.password,
    };
  }

  async function mapProblem(problem: ContestFormType["problems"][number]) {
    let testCases;
    if (!!problem.testCases && problem.testCases.length > 0) {
      testCases = await attachmentService.uploadAttachment(
        (problem.testCases as File[])[0],
      );
    }
    return {
      id: problem._id,
      title: problem.title,
      description: problem.description,
      timeLimit: problem.timeLimit,
      testCases,
    };
  }

  return {
    id: form.id as number,
    title: form.title,
    languages: form.languages,
    startAt: form.startAt,
    endAt: form.endAt,
    members: form.members.map(mapMember),
    problems: await Promise.all(form.problems.map(mapProblem)),
  };
}

export function fromResponseDTO(contest: ContestResponseDTO): ContestFormType {
  function mapMember(member: ContestResponseDTO["members"][number]) {
    return {
      _id: member.id,
      type: member.type,
      name: member.name,
      login: member.login,
    };
  }

  function mapProblem(problem: ContestResponseDTO["problems"][number]) {
    return {
      _id: problem.id,
      title: problem.title,
      description: problem.description,
      timeLimit: problem.timeLimit,
      testCasesAttachment: problem.testCases,
    };
  }

  return {
    id: contest.id,
    title: contest.title,
    languages: contest.languages,
    startAt: new Date(contest.startAt),
    endAt: new Date(contest.endAt),
    members: contest.members.map(mapMember),
    problems: contest.problems.map(mapProblem),
  };
}
