import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { Attachment } from "@/core/domain/model/Attachment";

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
