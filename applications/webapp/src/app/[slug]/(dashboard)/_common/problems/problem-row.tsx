import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { Button } from "@/app/_lib/component/base/form/button";
import { GridTable } from "@/app/_lib/component/base/table/grid-table";
import { ProblemStatusChip } from "@/app/_lib/component/chip/problem-status-chip";
import { cls } from "@/app/_lib/util/cls";
import { attachmentReader } from "@/config/composition";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { defineMessages } from "@/i18n/message";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";

const messages = defineMessages({
  timeLimit: {
    id: "app.[slug].(dashboard)._common.problems.problem-row.time-limit",
    defaultMessage: "{timeLimit} ms",
  },
  memoryLimit: {
    id: "app.[slug].(dashboard)._common.problems.problem-row.memory-limit",
    defaultMessage: "{memoryLimit} MB",
  },
});

type Props = {
  problem: ProblemPublicResponseDTO;
  index: number;
  problemStatus?: {
    isAccepted: boolean;
    acceptedAt?: string;
    wrongSubmissions: number;
  };
  contestId: string;
};

export function ProblemRow({
  problem,
  index,
  problemStatus,
  contestId,
}: Props) {
  return (
    <GridTable.Row
      key={problem.id}
      className={cls(index % 2 == 1 && "bg-content2/50")}
      data-testid="problem"
    >
      <GridTable.Cell data-testid="problem-letter">
        {problem.letter}
      </GridTable.Cell>
      <GridTable.Cell data-testid="problem-title">
        {problem.title}
      </GridTable.Cell>
      <GridTable.Cell data-testid="problem-time-limit">
        <FormattedMessage
          {...messages.timeLimit}
          values={{ timeLimit: problem.timeLimit }}
        />
      </GridTable.Cell>
      <GridTable.Cell data-testid="problem-memory-limit">
        <FormattedMessage
          {...messages.memoryLimit}
          values={{ memoryLimit: problem.memoryLimit }}
        />
      </GridTable.Cell>
      {problemStatus && (
        <GridTable.Cell className="justify-end" data-testid="problem-status">
          <ProblemStatusChip
            size="sm"
            isAccepted={problemStatus.isAccepted}
            acceptedAt={problemStatus.acceptedAt}
            wrongSubmissions={problemStatus.wrongSubmissions}
          />
        </GridTable.Cell>
      )}
      <GridTable.Cell>
        <Button
          isIconOnly
          color="primary"
          variant="light"
          size="sm"
          onPress={() =>
            attachmentReader.download(contestId, problem.description)
          }
          data-testid="problem-download"
        >
          <ArrowDownTrayIcon className="h-5" />
        </Button>
      </GridTable.Cell>
    </GridTable.Row>
  );
}
