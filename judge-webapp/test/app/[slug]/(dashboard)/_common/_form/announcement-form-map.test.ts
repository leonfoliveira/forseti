import { AnnouncementFormType } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form";
import { AnnouncementFormMap } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form-map";

describe("AnnouncementFormMap", () => {
  it("should map to InputDTO", () => {
    const data = {
      text: "New Announcement",
    } as AnnouncementFormType;

    const inputDTO = AnnouncementFormMap.toInputDTO(data);

    expect(inputDTO).toEqual({
      text: "New Announcement",
    });
  });
});
