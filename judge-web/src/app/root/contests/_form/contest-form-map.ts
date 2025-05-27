import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { Language } from "@/core/domain/enumerate/Language";
import {
  ContestFormMemberType,
  ContestFormProblemType,
  ContestFormType,
} from "@/app/root/contests/_form/contest-form-type";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { Attachment } from "@/core/domain/model/Attachment";

export function toCreateContestRequestDTO(
  data: ContestFormType,
): CreateContestInputDTO {
  const update = toUpdateRequestDTO(data);
  return update as CreateContestInputDTO;
}

export function toUpdateRequestDTO(
  data: ContestFormType,
): UpdateContestInputDTO {
  function mapMember(
    member: ContestFormMemberType,
  ): UpdateContestInputDTO["members"][number] {
    return {
      id: member._id,
      type: member.type as MemberType,
      name: member.name as string,
      login: member.login as string,
      password: member.password,
    };
  }

  function mapProblem(
    problem: ContestFormProblemType,
  ): UpdateContestInputDTO["problems"][number] {
    return {
      id: problem._id,
      title: problem.title as string,
      description: problem.description as Attachment | undefined,
      newDescription: problem.newDescription as File | undefined,
      timeLimit: problem.timeLimit as number,
      testCases: problem.testCases as Attachment | undefined,
      newTestCases: problem.newTestCases as File | undefined,
    };
  }

  return {
    id: data.id as number,
    title: data.title as string,
    languages: data.languages as Language[],
    startAt: data.startAt as Date,
    endAt: data.endAt as Date,
    members: (data.members || []).map(mapMember),
    problems: (data.problems || []).map(mapProblem),
  };
}

export function fromResponseDTO(
  contest: ContestPrivateResponseDTO,
): ContestFormType {
  function mapMember(member: ContestPrivateResponseDTO["members"][number]) {
    return {
      _id: member.id,
      type: member.type,
      name: member.name,
      login: member.login,
    };
  }

  function mapProblem(problem: ContestPrivateResponseDTO["problems"][number]) {
    return {
      _id: problem.id,
      title: problem.title,
      description: problem.description,
      newDescription: undefined,
      timeLimit: problem.timeLimit,
      testCases: problem.testCases,
      newTestCases: undefined,
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
