import { Chip } from "@/app/_lib/component/base/display/chip";
import { GridTable } from "@/app/_lib/component/base/table/grid-table";
import { ProblemStatusChip } from "@/app/_lib/component/chip/problem-status-chip";
import { FormattedDuration } from "@/app/_lib/component/format/formatted-duration";
import { cls } from "@/app/_lib/util/cls";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

type Props = {
  member: LeaderboardResponseDTO["members"][number];
  index: number;
  isHighlighted?: boolean;
};

export function LeaderboardMemberRow({ member, index, isHighlighted }: Props) {
  function getMedal(index: number) {
    if (index >= 12) {
      return index + 1;
    }
    const color = ["bg-yellow-400", "bg-gray-200", "bg-yellow-600"][
      Math.floor(index / 3)
    ];
    return (
      <Chip variant="flat" className={cls("font-semibold", color)}>
        {index + 1}
      </Chip>
    );
  }

  return (
    <GridTable.Row
      className={cls(
        index % 2 == 1 && "bg-content2",
        isHighlighted && "bg-primary-50",
      )}
      data-testid="member"
    >
      <GridTable.Cell data-testid="member-index">
        {getMedal(index)}
      </GridTable.Cell>
      <GridTable.Cell data-testid="member-name">{member.name}</GridTable.Cell>
      {member.problems.map((problem, index) => (
        <GridTable.Cell
          key={problem.id}
          className={cls("justify-center", index % 2 == 0 && "bg-content2")}
          data-testid="member-problem"
        >
          <ProblemStatusChip
            size="sm"
            isAccepted={problem.isAccepted}
            acceptedAt={problem.acceptedAt}
            wrongSubmissions={problem.wrongSubmissions}
          />
        </GridTable.Cell>
      ))}
      <GridTable.Cell className="justify-end" data-testid="member-score">
        {member.score}
      </GridTable.Cell>
      <GridTable.Cell className="justify-end" data-testid="member-penalty">
        <FormattedDuration ms={member.penalty * 1000} />
      </GridTable.Cell>
    </GridTable.Row>
  );
}
