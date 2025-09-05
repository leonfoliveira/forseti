import { randomUUID } from "crypto";

import { Attachment } from "@/core/domain/model/Attachment";

export function MockAttachment(partial: Partial<Attachment> = {}): Attachment {
  return {
    id: randomUUID(),
    filename: "test.txt",
    contentType: "text/plain",
    ...partial,
  };
}
