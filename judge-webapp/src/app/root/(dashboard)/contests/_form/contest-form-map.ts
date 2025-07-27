import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { Language } from "@/core/domain/enumerate/Language";
import {
  ContestFormMemberType,
  ContestFormProblemType,
  ContestFormD,
} from "@/app/root/(dashboard)/contests/_form/contest-form";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { Attachment } from "@/core/domain/model/Attachment";

export class ContestFormMap {
  static toCreateRequestDTO(data: ContestFormD): CreateContestInputDTO {
    const update = this.toUpdateRequestDTO(data);
    return update as CreateContestInputDTO;
  }

  static toUpdateRequestDTO(data: ContestFormD): UpdateContestInputDTO {
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
        letter: problem.letter as string,
        title: problem.title as string,
        description: problem.description as Attachment | undefined,
        newDescription: problem.newDescription as File | undefined,
        timeLimit: problem.timeLimit as number,
        memoryLimit: problem.memoryLimit as number,
        testCases: problem.testCases as Attachment | undefined,
        newTestCases: problem.newTestCases as File | undefined,
      };
    }

    return {
      id: data.id as string,
      slug: data.slug as string,
      title: data.title as string,
      languages: data.languages as Language[],
      startAt: data.startAt!.toISOString() as string,
      endAt: data.endAt!.toISOString() as string,
      members: (data.members || []).map(mapMember),
      problems: (data.problems || []).map(mapProblem),
    };
  }

  static fromResponseDTO(contest: ContestFullResponseDTO): ContestFormD {
    function mapMember(member: ContestFullResponseDTO["members"][number]) {
      return {
        _id: member.id,
        type: member.type,
        name: member.name,
        login: member.login,
      };
    }

    function mapProblem(problem: ContestFullResponseDTO["problems"][number]) {
      return {
        _id: problem.id,
        letter: problem.letter,
        title: problem.title,
        description: problem.description,
        newDescription: undefined,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        testCases: problem.testCases,
        newTestCases: undefined,
      };
    }

    return {
      id: contest.id,
      slug: contest.slug,
      title: contest.title,
      languages: contest.languages as [Language, ...Language[]],
      originalStartAt: new Date(contest.startAt),
      startAt: new Date(contest.startAt),
      endAt: new Date(contest.endAt),
      members: contest.members.map(mapMember),
      problems: contest.problems.map(mapProblem),
    };
  }
}
