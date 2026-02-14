import { AnnouncementForm } from "@/app/[slug]/(dashboard)/_common/announcements/announcement-form";

describe("AnnouncementForm", () => {
  describe("schema validation", () => {
    it("should validate when text is provided", () => {
      const validData = {
        text: "This is an important announcement",
      };

      const { error } = AnnouncementForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with short text", () => {
      const validData = {
        text: "Short",
      };

      const { error } = AnnouncementForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with maximum allowed text length", () => {
      const maxText = "a".repeat(255);
      const validData = {
        text: maxText,
      };

      const { error } = AnnouncementForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with special characters", () => {
      const validData = {
        text: "Contest rules updated! Please check @everyone #important",
      };

      const { error } = AnnouncementForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with unicode characters", () => {
      const validData = {
        text: "Contest updates 🚀 新しいルール変更 Новые правила",
      };

      const { error } = AnnouncementForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should fail validation when text is missing", () => {
      const invalidData = {};

      const { error } = AnnouncementForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.announcements.announcement-form.text-required",
      );
    });

    it("should fail validation when text is empty string", () => {
      const invalidData = {
        text: "",
      };

      const { error } = AnnouncementForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.announcements.announcement-form.text-required",
      );
    });

    it("should fail validation when text exceeds maximum length", () => {
      const tooLongText = "a".repeat(256);
      const invalidData = {
        text: tooLongText,
      };

      const { error } = AnnouncementForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["text"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.announcements.announcement-form.text-long",
      );
    });

    it("should fail validation when text is exactly 256 characters", () => {
      const tooLongText = "a".repeat(256);
      const invalidData = {
        text: tooLongText,
      };

      const { error } = AnnouncementForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe(
        "app.[slug].(dashboard)._common.announcements.announcement-form.text-long",
      );
    });
  });

  describe("toInputDTO", () => {
    it("should convert form data to input DTO", () => {
      const formData = {
        text: "This is an important announcement for all contestants",
      };

      const dto = AnnouncementForm.toInputDTO(formData);

      expect(dto).toEqual({
        text: "This is an important announcement for all contestants",
      });
    });

    it("should handle special characters in text", () => {
      const formData = {
        text: "Contest rules updated! Please check @everyone #important 🚀",
      };

      const dto = AnnouncementForm.toInputDTO(formData);

      expect(dto).toEqual({
        text: "Contest rules updated! Please check @everyone #important 🚀",
      });
    });

    it("should handle unicode characters", () => {
      const formData = {
        text: "Contest updates 新しいルール変更 Новые правила",
      };

      const dto = AnnouncementForm.toInputDTO(formData);

      expect(dto).toEqual({
        text: "Contest updates 新しいルール変更 Новые правила",
      });
    });
  });

  describe("getDefault", () => {
    it("should return default form values", () => {
      const defaultValues = AnnouncementForm.getDefault();

      expect(defaultValues).toEqual({
        text: "",
      });
    });
  });

  describe("messages", () => {
    it("should have all required message definitions", () => {
      expect(AnnouncementForm.messages.textRequired).toBeDefined();
      expect(AnnouncementForm.messages.textLong).toBeDefined();

      expect(AnnouncementForm.messages.textRequired.id).toBe(
        "app.[slug].(dashboard)._common.announcements.announcement-form.text-required",
      );
      expect(AnnouncementForm.messages.textLong.id).toBe(
        "app.[slug].(dashboard)._common.announcements.announcement-form.text-long",
      );
    });
  });
});
