import { Attachment } from "@/core/domain/model/Attachment";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";

export type UpdateContestInputDTO = Omit<
  UpdateContestRequestDTO,
  "problems"
> & {
  problems: (Omit<
    UpdateContestRequestDTO["problems"][number],
    "description" | "testCases"
  > & {
    description?: Attachment;
    newDescription?: File;
    testCases?: Attachment;
    newTestCases?: File;
  })[];
};
