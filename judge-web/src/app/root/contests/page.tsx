"use client";

import { useAtomValue } from "jotai";
import { containerAtom } from "@/app/_atom/container-atom";
import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { useFetcher } from "@/app/_util/fetcher-hook";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import Link from "next/link";
import { useToast } from "@/app/_util/toast-hook";
import { formatFromISO } from "@/app/_util/date-utils";

function RootPage() {
  const { authorizationService, contestService } = useAtomValue(containerAtom);
  const toast = useToast();
  const router = useRouter();

  const contestsFetcher = useFetcher<ContestResponseDTO[]>([]);

  useEffect(() => {
    const authorization = authorizationService.getAuthorization();
    if (!authorization) {
      redirect("/root/auth");
    }

    const fetchContests = async () => {
      try {
        await contestsFetcher.fetch(() => contestService.findAllContests());
      } catch (error) {
        if (
          error instanceof UnauthorizedException ||
          error instanceof ForbiddenException
        ) {
          redirect("/root/auth");
        } else {
          toast.error();
        }
      }
    };
    fetchContests().then();
  }, []);

  function getStatus(contest: ContestResponseDTO) {
    const now = new Date();
    const startAt = new Date(contest.startAt);
    const endAt = new Date(contest.endAt);

    if (now < startAt) {
      return "NOT_STARTED";
    } else if (now >= startAt && now <= endAt) {
      return "IN_PROGRESS";
    } else {
      return "ENDED";
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
        <h2 className="m-0">Contests</h2>
        <Link href="/root/contests/new" className="btn btn-primary">
          New
        </Link>
      </div>
      {contestsFetcher.isLoading && <div className="spinner-border" />}
      {!contestsFetcher.isLoading && !contestsFetcher.hasError && (
        <table className="table m-auto">
          <thead>
            <tr className="bg-dark">
              <th>ID</th>
              <th className="w-50">Name</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contestsFetcher.data?.map((contest) => (
              <tr
                key={contest.id}
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/root/contests/${contest.id}`)}
              >
                <td>{contest.id}</td>
                <td>{contest.title}</td>
                <td>{formatFromISO(contest.startAt)}</td>
                <td>{formatFromISO(contest.endAt)}</td>
                <th>
                  {getStatus(contest) === "IN_PROGRESS" && (
                    <span className="badge text-bg-success">In Progress</span>
                  )}
                  {getStatus(contest) === "ENDED" && (
                    <span className="badge text-bg-danger">Ended</span>
                  )}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RootPage;
