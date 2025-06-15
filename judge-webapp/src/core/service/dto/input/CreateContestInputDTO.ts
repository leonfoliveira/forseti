import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { Attachment } from "@/core/domain/model/Attachment";

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
