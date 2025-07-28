import { announcementFormSchema } from "@/app/contests/[slug]/_common/_form/announcement-form-schema";

describe("announcementFormSchema", () => {
  const validData = {
    text: "This is a valid announcement",
  };

  it("should validate valid data", () => {
    expect(announcementFormSchema.validate(validData).error).toBeUndefined();
  });

  it("should validate text", () => {
    expect(
      announcementFormSchema.validate({ ...validData, text: undefined }).error
        ?.message,
    ).toBe("text:required");
    expect(
      announcementFormSchema.validate({ ...validData, text: "" }).error
        ?.message,
    ).toBe("text:required");
  });
});
