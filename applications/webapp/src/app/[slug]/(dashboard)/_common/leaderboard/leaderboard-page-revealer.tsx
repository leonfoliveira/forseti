import { ArrowDown01Icon, AwardIcon, LoaderIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react"; // Added useState, useMemo

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/problem-letter-badge";
import { ProblemStatusBadge } from "@/app/_lib/component/display/badge/problem-status-badge";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Theme, useTheme } from "@/app/_lib/provider/theme-provider";
import { cn } from "@/app/_lib/util/cn";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  getError: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page-revealer.get-error",
    defaultMessage: "Failed to load leaderboard data",
  },
  finalStanding: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page-revealer.final-standing",
    defaultMessage: "Final Standing",
  },
  headerContestant: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page-revealer.header-contestant",
    defaultMessage: "Contestant",
  },
  headerScore: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page-revealer.header-score",
    defaultMessage: "Score",
  },
  headerPenalty: {
    id: "app.[slug].(dashboard)._common.leaderboard.leaderboard-page-revealer.header-penalty",
    defaultMessage: "Penalty",
  },
});

type Props = {
  problems: ProblemResponseDTO[];

  onClose: () => void;
};

export function LeaderboardPageRevealer({ problems, onClose }: Props) {
  const contest = useAppSelector((state) => state.contest);
  const leaderboardState = useLoadableState<LeaderboardResponseDTO>({
    isLoading: true,
  });
  const { theme } = useTheme();
  const toast = useToast();

  const [revealedCount, setRevealedCount] = useState(0);

  const contestantRows = useMemo(() => {
    return (leaderboardState.data?.rows || []).filter(
      (row) => row.memberType === MemberType.CONTESTANT,
    );
  }, [leaderboardState.data]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setRevealedCount((prev) => Math.min(prev + 1, contestantRows.length));
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setRevealedCount((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contestantRows.length]);

  useEffect(() => {
    async function fetch() {
      try {
        const leaderboard = await Composition.leaderboardReader.get(contest.id);
        leaderboardState.finish(leaderboard);
      } catch (error) {
        await leaderboardState.fail(error, {
          default: () => toast.error(messages.getError),
        });
      }
    }
    fetch();
  }, []);

  function getMedal(rank: number) {
    if (rank > 12) return rank;
    const color = [
      "text-yellow-400 fill-yellow-400",
      "text-gray-300 fill-gray-300",
      "text-yellow-600 fill-yellow-600",
    ][Math.floor((rank - 1) / 4)];
    return (
      <>
        <AwardIcon
          className={cn("fill-foreground inline h-5", color)}
          strokeWidth={3}
        />
        {rank}
      </>
    );
  }

  return (
    <div className="bg-muted absolute top-0 left-0 h-screen w-screen overflow-x-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .flip-row { perspective: 1000px; }
        .flip-cell-inner {
          position: relative;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .is-revealed .flip-cell-inner { transform: rotateX(180deg); }
        .cell-front, .cell-back {
          backface-visibility: hidden;
          width: 100%;
          height: 100%;
        }
        .cell-back {
          position: absolute;
          top: 0; left: 0;
          transform: rotateX(180deg);
          display: flex;
          align-items: center;
          height: 100%;
          width: 100%;
        }
        .cell-front { min-height: 30px; }
      `,
        }}
      />

      <div className="bg-card fixed top-0 z-10 grid w-screen [grid-template-columns:1fr_1fr_1fr] gap-4 border-b px-6 py-2">
        <div className="flex gap-2">
          <div className="mr-2 flex items-center justify-center">
            <Image
              src={theme === Theme.DARK ? "/icon-dark.png" : "/icon-light.png"}
              alt="Logo"
              width={30}
              height={30}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center truncate text-2xl font-bold">
          <p>{contest.title}</p>
          <p className="text-muted-foreground text-sm font-normal">
            <FormattedMessage {...messages.finalStanding} />
          </p>
        </div>
        <div className="text-end">
          <Button
            size="icon-lg"
            onClick={onClose}
            variant="secondary"
            data-testid="close-button"
          >
            <XIcon />
          </Button>
        </div>
      </div>

      {leaderboardState.isLoading && (
        <div className="flex h-screen w-screen items-center justify-center">
          <LoaderIcon className="animate-spin" size={48} />
        </div>
      )}

      {!leaderboardState.isLoading && !leaderboardState.error && (
        <>
          <div className="bg-card mx-auto mt-25 max-w-[1920px] p-5">
            <Table className="border-b-1">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>
                    <ArrowDown01Icon size={16} />
                  </TableHead>
                  <TableHead>
                    <FormattedMessage {...messages.headerContestant} />
                  </TableHead>
                  <TableHead>
                    <FormattedMessage {...messages.headerScore} />
                  </TableHead>
                  <TableHead>
                    <FormattedMessage {...messages.headerPenalty} />
                  </TableHead>
                  {problems.map((p) => (
                    <TableHead key={p.id} className="text-center">
                      <ProblemLetterBadge problem={p} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {contestantRows.map((row, index) => {
                  const isRevealed =
                    index >= contestantRows.length - revealedCount;

                  return (
                    <TableRow
                      key={row.memberId}
                      className={cn(
                        "flip-row hover:bg-inherit",
                        isRevealed && "is-revealed",
                      )}
                      data-testid="row"
                    >
                      <TableCell data-testid="cell-rank">
                        <div className="flip-cell-inner">
                          <div className="cell-front bg-muted" />
                          <div className="cell-back">{getMedal(index + 1)}</div>
                        </div>
                      </TableCell>
                      <TableCell data-testid="cell-name">
                        <div className="flip-cell-inner">
                          <div className="cell-front bg-muted" />
                          <div className="cell-back">{row.memberName}</div>
                        </div>
                      </TableCell>
                      <TableCell data-testid="cell-score">
                        <div className="flip-cell-inner">
                          <div className="cell-front bg-muted" />
                          <div className="cell-back">{row.score}</div>
                        </div>
                      </TableCell>
                      <TableCell data-testid="cell-penalty">
                        <div className="flip-cell-inner">
                          <div className="cell-front bg-muted" />
                          <div className="cell-back">{row.penalty}</div>
                        </div>
                      </TableCell>
                      {row.cells.map((cell) => (
                        <TableCell
                          key={cell.problemId}
                          className="text-center"
                          data-testid={`cell-problem-${cell.problemId}`}
                        >
                          <div className="flip-cell-inner">
                            <div className="cell-front bg-muted" />
                            <div className="cell-back">
                              <ProblemStatusBadge
                                isAccepted={cell.isAccepted}
                                acceptedAt={cell.acceptedAt}
                                wrongSubmissions={cell.wrongSubmissions}
                              />
                            </div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
