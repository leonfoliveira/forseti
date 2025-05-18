import { AttachmentRequestDTO } from "@/core/repository/dto/request/AttachmentRequestDTO";

export async function toAttachmentRequestDTO(
  file: File,
): Promise<AttachmentRequestDTO> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve({
        filename: file.name,
        content: result.split(",")[1],
      });
    };
    reader.onerror = (error) => reject(error);
  });
}
