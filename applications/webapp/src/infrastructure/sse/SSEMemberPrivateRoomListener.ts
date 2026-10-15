import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { SSERoomListener } from "@/infrastructure/sse/SSERoomListener";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

import { MemberPrivateRoomListener } from "@/port/output/sse/MemberPrivateRoomListener";

export class SSEMemberPrivateRoomListener
  extends SSERoomListener
  implements MemberPrivateRoomListener
{
  private basePath = (memberId: string) => `/v1/sse/members/${memberId}`;

  constructor(apiUrl: string) {
    super(apiUrl);
  }

  async subscribe(
    memberId: string,
    listeners: {
      SUBMISSION_UPDATED: (submission: SubmissionWithCodeResponseDTO) => void;
      CLARIFICATION_ANSWERED: (clarification: ClarificationResponseDTO) => void;
    },
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void> {
    return super.subscribe(
      this.basePath(memberId),
      listeners,
      onDisconnect,
      onReconnect,
    );
  }
}
