import { SettingsForm } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/MockDTOs";

describe("SettingsForm", () => {
  it("maps contest DTO values into editable fields and back", () => {
    const dto = MockContestWithMembersAndProblemsDTO();
    const form = SettingsForm.fromResponseDTO(dto);
    expect(form.contest.slug).toBe(dto.slug);
    expect(form.problems[0].timeLimit).toBe(String(dto.problems[0].timeLimit));
    expect(form.members[0].login).toBe(dto.members[0].login);
    const input = SettingsForm.toInputDTO(form);
    expect(input).toMatchObject({
      slug: dto.slug,
      title: dto.title,
      languages: dto.languages,
      problems: [{ letter: "A", timeLimit: dto.problems[0].timeLimit }],
    });
  });

  it("parses optional file arrays and validates required form fields", () => {
    const file = new File(["content"], "content.pdf", { type: "application/pdf" });
    expect(SettingsForm.parseFiles([file])).toBe(file);
    expect(SettingsForm.parseFiles([])).toBeUndefined();
    const result = SettingsForm.schema(ContestStatus.NOT_STARTED).validate({
      contest: { slug: "", title: "", languages: {}, startAt: "", endAt: "" },
      problems: [],
      members: [],
    });
    expect(result.error).toBeDefined();
  });
});
