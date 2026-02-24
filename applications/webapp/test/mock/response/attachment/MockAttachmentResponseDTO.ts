import { v4 as uuidv4 } from "uuid";

import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export function MockAttachmentResponseDTO(
  partial: Partial<AttachmentResponseDTO> = {},
): AttachmentResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    filename: "test.txt",
    contentType: "text/plain",
    version: 1,
    ...partial,
  };
}
