import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";

export type GetUploadSignedUrlRequest = {
  filename: string;
  context: AttachmentContext;
  contentType: string;
};
