import { Attachment } from "@/core/domain/model/Attachment";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";

export type CreateContestInputDTO = Omit<
  CreateContestRequestDTO,
  "problems"
> & {
  problems: (Omit<
    CreateContestRequestDTO["problems"][number],
    "description" | "testCases"
  > & {
    description?: Attachment;
    newDescription: File;
    testCases?: Attachment;
    newTestCases: File;
  })[];
};
