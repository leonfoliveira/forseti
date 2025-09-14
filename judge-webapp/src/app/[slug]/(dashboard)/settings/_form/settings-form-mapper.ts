import { parseAbsoluteToLocal } from "@internationalized/date";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";

function parseFiles(files: File[] | undefined) {
  return !!files && files.length > 0 ? files[0] : undefined;
}

export class SettingsFormMapper {
  static fromResponseDTOToForm(contest: ContestFullResponseDTO): SettingsForm {
    const problems = contest.problems
      .map((problem) => ({
        _id: problem.id,
        letter: problem.letter,
        title: problem.title,
        description: problem.description,
        newDescription: [],
        timeLimit: problem.timeLimit.toString(),
        memoryLimit: problem.memoryLimit.toString(),
        testCases: problem.testCases,
        newTestCases: [],
      }))
      .sort((a, b) => a.letter.localeCompare(b.letter));

    const members = contest.members.map((member) => ({
      _id: member.id,
      type: member.type,
      name: member.name,
      login: member.login,
      password: undefined,
    }));

    return {
      id: contest.id,
      slug: contest.slug,
      title: contest.title,
      languages: contest.languages,
      startAt: parseAbsoluteToLocal(contest.startAt),
      endAt: parseAbsoluteToLocal(contest.endAt),
      settings: contest.settings,
      members,
      problems,
    };
  }

  static fromFormToInputDTO(form: SettingsForm): UpdateContestInputDTO {
    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      languages: form.languages,
      startAt: form.startAt.toDate().toISOString(),
      endAt: form.endAt.toDate().toISOString(),
      settings: form.settings,
      members: form.members.map((member) => ({
        id: member._id,
        type: member.type,
        name: member.name,
        login: member.login,
        password:
          member.password && member.password.length > 0
            ? member.password
            : undefined,
      })),
      problems: form.problems.map((problem, idx) => ({
        id: problem._id,
        letter: String.fromCharCode(65 + idx),
        title: problem.title,
        description: problem.description,
        newDescription: parseFiles(problem.newDescription),
        timeLimit: parseInt(problem.timeLimit, 10),
        memoryLimit: parseInt(problem.memoryLimit, 10),
        testCases: problem.testCases,
        newTestCases: parseFiles(problem.newTestCases),
      })),
    };
  }
}
