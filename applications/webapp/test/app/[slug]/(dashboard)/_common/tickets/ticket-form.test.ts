import { TicketForm } from "@/app/[slug]/(dashboard)/_common/tickets/ticket-form";
import { TicketType } from "@/core/domain/enumerate/TicketType";

describe("TicketForm", () => {
  describe("schema", () => {
    const validData = {
      type: TicketType.TECHNICAL_SUPPORT,
      description: "I need help with my account",
    };

    it("should validate valid data", () => {
      const { error } = TicketForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should require type", () => {
      const { error } = TicketForm.schema.validate({
        ...validData,
        type: undefined,
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe(
        TicketForm.messages.typeRequired.id,
      );
    });

    it("should require description", () => {
      const { error } = TicketForm.schema.validate({
        ...validData,
        description: undefined,
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe(
        TicketForm.messages.descriptionRequired.id,
      );
    });

    it("should validate type values", () => {
      const { error } = TicketForm.schema.validate({
        ...validData,
        type: TicketType.SUBMISSION_PRINT,
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe(
        TicketForm.messages.typeInvalid.id,
      );
    });

    it("should validate description length", () => {
      const longDescription = "a".repeat(512);
      const { error } = TicketForm.schema.validate({
        ...validData,
        description: longDescription,
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toBe(
        TicketForm.messages.descriptionTooLong.id,
      );
    });
  });

  it("should map to request DTO correctly", () => {
    const data = {
      type: TicketType.NON_TECHNICAL_SUPPORT,
      description: "I have a question about the contest rules",
    };

    const expectedDTO = {
      type: TicketType.NON_TECHNICAL_SUPPORT,
      properties: {
        description: "I have a question about the contest rules",
      },
    };

    const dto = TicketForm.toRequestDTO(data);
    expect(dto).toEqual(expectedDTO);
  });

  it("should return default values", () => {
    const defaultValues = TicketForm.getDefault();
    expect(defaultValues).toEqual({
      type: "" as TicketType,
      description: "",
    });
  });
});
