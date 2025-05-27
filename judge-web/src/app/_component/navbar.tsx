import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_component/form/button";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { formatDifference } from "@/app/_util/date-utils";
import { authorizationService } from "@/app/_composition";
import { useAuthorization } from "@/app/_util/authorization-hook";

type Props = {
  contest?: ContestSummaryResponseDTO;
  signInPath: string;
};

export function Navbar({ contest, signInPath }: Props) {
  const router = useRouter();
  const authorization = useAuthorization();
  const diffRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (contest) {
      const interval = setInterval(() => {
        if (diffRef.current) {
          const diff = Math.max(
            new Date(contest.endAt).getTime() - new Date().getTime(),
            0,
          );
          diffRef.current.textContent = formatDifference(diff);
          if (diff <= 1000 * 60 * 20) {
            diffRef.current.classList.add("text-red-500");
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [contest]);

  function signOut() {
    authorizationService.deleteAuthorization();
    router.push(signInPath);
  }

  return (
    <nav className="grid [grid-template-columns:1fr_auto_1fr] items-center bg-white p-2">
      <div className="text-lg font-semibold">{contest?.title}</div>
      <div className="justify-self-center text-red-">
        <span ref={diffRef} className="font-mono" />
      </div>
      <div className="justify-self-end flex items-center">
        <p className="mr-5">{authorization?.member.name}</p>
        <Button onClick={signOut} variant="outline-primary">
          Sign out
        </Button>
      </div>
    </nav>
  );
}
