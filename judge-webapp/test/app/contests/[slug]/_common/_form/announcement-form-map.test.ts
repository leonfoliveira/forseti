import { AnnouncementForm } from "@/app/contests/[slug]/_common/_form/announcement-form";
import { AnnouncementFormMap } from "@/app/contests/[slug]/_common/_form/announcement-form-map";

describe("AnnouncementFormMap", () => {
  it("should map AnnouncementFormType to CreateAnnouncementRequestDTO", () => {
    const input: AnnouncementForm = {
      text: "This is a test announcement",
    };

    const result = AnnouncementFormMap.toInputDTO(input);

    expect(result).toEqual({
      text: "This is a test announcement",
    });
  });
});
