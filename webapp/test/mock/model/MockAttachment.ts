import { v4 as uuidv4 } from "uuid";

import { Attachment } from "@/core/domain/model/Attachment";

export function MockAttachment(partial: Partial<Attachment> = {}): Attachment {
  return {
    id: uuidv4(),
    filename: "test.txt",
    contentType: "text/plain",
    ...partial,
  };
}
