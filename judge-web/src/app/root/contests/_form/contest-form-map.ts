import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { Language } from "@/core/domain/enumerate/Language";
import {
  ContestFormMemberType,
  ContestFormProblemType,
  ContestFormType,
} from "@/app/root/contests/_form/contest-form-type";
import { MemberType } from "@/core/domain/enumerate/MemberType";

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
  function mapMember(
    member: ContestFormMemberType,
  ): UpdateContestRequestDTO["members"][number] {
    return {
      id: member._id,
      type: member.type as MemberType,
      name: member.name as string,
      login: member.login as string,
      password: member.password,
    };
  }

  async function mapProblem(
    problem: ContestFormProblemType,
  ): Promise<UpdateContestRequestDTO["problems"][number]> {
    let testCases;
    if (!!problem.testCases) {
      testCases = await attachmentService.uploadAttachment(problem.testCases);
    }
    return {
      id: problem._id,
      title: problem.title as string,
      description: problem.description as string,
      timeLimit: problem.timeLimit as number,
      testCases,
    };
  }

  return {
    id: form.id as number,
    title: form.title as string,
    languages: form.languages as Language[],
    startAt: form.startAt as Date,
    endAt: form.endAt as Date,
    members: (form.members as []).map(mapMember),
    problems: await Promise.all((form.problems as []).map(mapProblem)),
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
      _testCases: problem.testCases,
    };
  }

  return {
    id: contest.id,
    title: contest.title,
    languages: contest.languages as [Language, ...Language[]],
    startAt: new Date(contest.startAt),
    endAt: new Date(contest.endAt),
    members: contest.members.map(mapMember),
    problems: contest.problems.map(mapProblem),
  };
}
