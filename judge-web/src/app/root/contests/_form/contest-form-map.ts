import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { Language } from "@/core/domain/enumerate/Language";
import {
  ContestFormMemberType,
  ContestFormProblemType,
  ContestFormType,
} from "@/app/root/contests/_form/contest-form-type";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";

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
      description: problem.description as string,
      timeLimit: problem.timeLimit as number,
      testCases: problem.testCases as File | undefined,
    };
  }

  return {
    id: data.id as number,
    title: data.title as string,
    languages: data.languages as Language[],
    startAt: data.startAt as Date,
    endAt: data.endAt as Date,
    members: (data.members as []).map(mapMember),
    problems: (data.problems as []).map(mapProblem),
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
