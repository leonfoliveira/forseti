import { announcementFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form-schema";

describe("announcementFormSchema", () => {
  const validData = {
    text: "New Announcement",
  };

  it("should validate data", () => {
    expect(
      announcementFormSchema.validate(validData).error?.message,
    ).toBeUndefined();
  });

  describe("text", () => {
    it("should not be empty", () => {
      expect(
        announcementFormSchema.validate({ ...validData, text: "" }).error
          ?.message,
      ).not.toBeUndefined();
    });

    it("should have less then 256 characters", () => {
      expect(
        announcementFormSchema.validate({ ...validData, text: "a".repeat(256) })
          .error?.message,
      ).not.toBeUndefined();
    });
  });
});
