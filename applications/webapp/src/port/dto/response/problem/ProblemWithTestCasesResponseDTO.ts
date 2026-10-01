import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";

export type ProblemWithTestCasesResponseDTO = ProblemResponseDTO & {
  testCases: AttachmentResponseDTO;
};
