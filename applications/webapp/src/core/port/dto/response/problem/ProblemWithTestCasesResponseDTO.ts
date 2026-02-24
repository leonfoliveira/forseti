import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";

export type ProblemWithTestCasesResponseDTO = ProblemResponseDTO & {
  testCases: AttachmentResponseDTO;
};
