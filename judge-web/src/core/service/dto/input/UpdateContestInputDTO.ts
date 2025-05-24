import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";

export type UpdateContestInputDTO = Omit<
  UpdateContestRequestDTO,
  "problems"
> & {
  problems: (Omit<UpdateContestRequestDTO["problems"][number], "testCases"> & {
    testCases?: File;
  })[];
};
