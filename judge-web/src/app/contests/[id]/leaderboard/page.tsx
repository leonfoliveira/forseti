"use client";

import { useContainer } from "@/app/_atom/container-atom";
import { use, useEffect } from "react";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { LeaderboardOutputDTO } from "@/core/repository/dto/response/LeaderboardOutputDTO";
import { ServerException } from "@/core/domain/exception/ServerException";
import { Table } from "@/app/_component/table/table";
import { TableRow } from "@/app/_component/table/table-row";
import { TableSection } from "@/app/_component/table/table-section";
import { TableCell } from "@/app/_component/table/table-cell";
import { Spinner } from "@/app/_component/spinner";
import { cls } from "@/app/_util/cls";

export default function ContestLeaderboardPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { contestService } = useContainer();
  const leaderboardFetcher = useFetcher<LeaderboardOutputDTO>();

  useEffect(() => {
    async function getLeaderboard() {
      await leaderboardFetcher.fetch(() => contestService.getLeaderboard(id), {
        errors: {
          [ServerException.name]: "Error loading leaderboard",
        },
      });
    }
    getLeaderboard();
  }, []);

  console.log("leaderboardFetcher", leaderboardFetcher);

  if (leaderboardFetcher.isLoading || !leaderboardFetcher.data) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  const problemsLength = leaderboardFetcher.data.problems.length;

  return (
    <Table>
      <TableSection>
        <TableRow>
          <TableCell header></TableCell>
          {leaderboardFetcher.data.problems.map((problem, index) => (
            <TableCell
              key={problem.id}
              header
              align="center"
              className={cls(index % 2 === 0 && "bg-gray-50")}
            >
              {problem.title}
            </TableCell>
          ))}
          <TableCell
            header
            align="right"
            className={cls(problemsLength % 2 === 0 && "bg-gray-50")}
          >
            Penalty
          </TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {leaderboardFetcher.data.members.map((member, index) => (
          <TableRow key={member.id} className="h-15">
            <TableCell>{`${index + 1}. ${member.name}`}</TableCell>
            {member.problems.map((problem, index) => (
              <TableCell
                key={problem.id}
                align="center"
                className={cls(index % 2 === 0 && "bg-gray-50")}
              >
                <div className="h-full flex flex-col justify-center items-center">
                  {problem.isAccepted && (
                    <p className="h-[1.2em] text-xl font-semibold text-green-500">
                      AC
                    </p>
                  )}
                  {problem.wrongSubmissions > 0 && (
                    <p className="text-sm font-semibold text-red-500">
                      +{problem.wrongSubmissions}
                    </p>
                  )}
                </div>
              </TableCell>
            ))}
            <TableCell
              align="right"
              className={cls(problemsLength % 2 === 0 && "bg-gray-50")}
            >
              {member.penalty || ""}
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  );
}
