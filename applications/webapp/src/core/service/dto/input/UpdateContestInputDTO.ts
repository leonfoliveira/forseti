import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";

export type UpdateContestInputDTO = Omit<
  UpdateContestRequestDTO,
  "problems"
> & {
  problems: (Omit<
    UpdateContestRequestDTO["problems"][number],
    "description" | "testCases"
  > & {
    description?: AttachmentResponseDTO;
    newDescription?: File;
    testCases?: AttachmentResponseDTO;
    newTestCases?: File;
  })[];
};
