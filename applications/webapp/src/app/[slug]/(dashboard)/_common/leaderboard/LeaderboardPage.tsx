import { clsx } from "clsx";
import { ArrowDown01Icon, AwardIcon } from "lucide-react";
import { useState } from "react";

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/ProblemLetterBadge";
import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/ProblemStatusBadge";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { Page } from "@/app/_lib/component/page/Page";
import { Alert, AlertDescription } from "@/app/_lib/component/shadcn/alert";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import {
  Field,
  FieldContent,
  FieldLabel,
} from "@/app/_lib/component/shadcn/field";
import { Switch } from "@/app/_lib/component/shadcn/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { useAppSelector } from "@/app/_lib/store/Store";
import { MemberType } from "@/domain/enumerate/MemberType";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";

type Props = {
  problems: ProblemResponseDTO[];
  leaderboard: LeaderboardResponseDTO;
};

/**
 * A generic leaderboard page component for displaying contest results.
 */
export function LeaderboardPage({ problems, leaderboard }: Props) {
  const [doesShowUnofficial, setDoesShowUnofficial] = useState(true);
  const session = useAppSelector((state) => state.session);

  const rows = leaderboard.rows.filter(
    (row) =>
      row.memberType === MemberType.CONTESTANT ||
      (doesShowUnofficial &&
        row.memberType === MemberType.UNOFFICIAL_CONTESTANT),
  );

  function getMedal(rank: number) {
    if (rank > 12) {
      return rank;
    }
    const color = [
      "text-yellow-400 fill-yellow-400",
      "text-gray-300 fill-gray-300",
      "text-yellow-600 fill-yellow-600",
    ][Math.floor((rank - 1) / 4)];
    return (
      <>
        <AwardIcon
          className={clsx("fill-foreground inline h-5", color)}
          strokeWidth={3}
        />
        {rank}
      </>
    );
  }

  const ranks: Record<string, number> = {};
  let currentRank = 1;
  for (let i = 0; i < rows.length; i++) {
    ranks[rows[i].memberId] = currentRank;
    currentRank++;
  }

  return (
    <Page
      title="[slug].(dashboard)._common.leaderboard.LeaderboardPage.pageTitle"
      description="[slug].(dashboard)._common.leaderboard.LeaderboardPage.pageDescription"
    >
      <Card className="my-5">
        <CardContent>
          <div className="mb-4">
            <Field orientation="horizontal">
              <Switch
                id="doesShowUnofficial"
                checked={doesShowUnofficial}
                onCheckedChange={setDoesShowUnofficial}
                data-testid="does-show-unofficial"
              />
              <FieldContent>
                <FieldLabel htmlFor="doesShowUnofficial">
                  <FormattedMessage id="[slug].(dashboard)._common.leaderboard.LeaderboardPage.showUnnoficial" />
                </FieldLabel>
              </FieldContent>
            </Field>
          </div>
          <Table data-testid="leaderboard-table" className="border-b">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>
                  <ArrowDown01Icon size={16} />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.leaderboard.LeaderboardPage.headerContestant" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.leaderboard.LeaderboardPage.headerScore" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.leaderboard.LeaderboardPage.headerPenalty" />
                </TableHead>
                {problems.map((problem) => (
                  <TableHead key={problem.id} className="text-center">
                    <ProblemLetterBadge problem={problem} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.memberId}
                  className={clsx(
                    row.memberId === session?.member.id && "font-bold",
                  )}
                  data-testid="leaderboard-member-row"
                >
                  <TableCell data-testid="member-rank">
                    {ranks[row.memberId] !== undefined &&
                      getMedal(ranks[row.memberId])}
                  </TableCell>
                  <TableCell data-testid="member-name">
                    {row.memberType === MemberType.UNOFFICIAL_CONTESTANT ? (
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="[slug].(dashboard)._common.leaderboard.LeaderboardPage.unnoficialName"
                          values={{ name: row.memberName }}
                        />
                      </span>
                    ) : (
                      row.memberName
                    )}
                  </TableCell>
                  <TableCell data-testid="member-score">{row.score}</TableCell>
                  <TableCell data-testid="member-penalty">
                    {row.penalty}
                  </TableCell>
                  {row.cells.map((cell) => (
                    <TableCell
                      key={cell.problemId}
                      className="text-center"
                      data-testid="member-problem"
                    >
                      <ProblemStatusBadge
                        isAccepted={cell.isAccepted}
                        acceptedAt={cell.acceptedAt}
                        wrongSubmissions={cell.wrongSubmissions}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Alert className="bg-muted mt-7 py-2">
            <AlertDescription className="text-xs">
              <FormattedMessage id="[slug].(dashboard)._common.leaderboard.LeaderboardPage.help" />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </Page>
  );
}
