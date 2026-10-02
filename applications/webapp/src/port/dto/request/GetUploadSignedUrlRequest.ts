import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";

export type GetUploadSignedUrlRequest = {
  fileName: string;
  context: AttachmentContext;
  contentType: string;
};
