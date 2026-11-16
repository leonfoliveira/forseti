import { AnnouncementForm } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementForm";

describe("AnnouncementForm", () => {
  describe("schema", () => {
    const validData = {
      text: "Announcement",
    };

    it("validates correct data", () => {
      expect(AnnouncementForm.schema.validate(validData).error).toBeUndefined();
    });

    it("validates text", () => {
      expect(
        AnnouncementForm.schema.validate({ ...validData, text: "" }).error
          ?.message,
      ).toContain("Text is Required");
      expect(
        AnnouncementForm.schema.validate({
          ...validData,
          text: "a".repeat(501),
        }).error?.message,
      ).toContain("Cannot exceed 500 characters");
    });
  });

  describe("toInputDTO", () => {
    it("converts correct data to DTO", () => {
      const dto = AnnouncementForm.toInputDTO({
        text: "Announcement",
      });

      expect(dto).toEqual({
        text: "Announcement",
      });
    });
  });

  describe("getDefault", () => {
    it("returns default data", () => {
      expect(AnnouncementForm.getDefault()).toEqual({
        text: "",
      });
    });
  });
});
