import { v4 as uuidv4 } from "uuid";

import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export function MockAttachment(
  partial: Partial<AttachmentResponseDTO> = {},
): AttachmentResponseDTO {
  return {
    id: uuidv4(),
    filename: "test.txt",
    contentType: "text/plain",
    ...partial,
  };
}
