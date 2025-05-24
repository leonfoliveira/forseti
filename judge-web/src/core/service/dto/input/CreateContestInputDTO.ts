import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";

export type CreateContestInputDTO = Omit<
  CreateContestRequestDTO,
  "problems"
> & {
  problems: (Omit<CreateContestRequestDTO["problems"][0], "testCases"> & {
    testCases: File;
  })[];
};
