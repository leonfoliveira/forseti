import React, { useEffect, useRef, useState } from "react";
import { useContainer } from "@/app/_atom/container-atom";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_component/form/button";
import { Authorization } from "@/core/domain/model/Authorization";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { formatDifference } from "@/app/_util/date-utils";

type Props = {
  contest?: ContestShortResponseDTO;
  signInPath: string;
};

export function Navbar({ contest, signInPath }: Props) {
  const { authorizationService } = useContainer();
  const router = useRouter();
  const [authorization, setAuthorization] = useState<
    Authorization | undefined
  >();
  const diffRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setAuthorization(authorizationService.getAuthorization());
  }, []);

  useEffect(() => {
    if (contest) {
      const interval = setInterval(() => {
        if (diffRef.current) {
          diffRef.current.textContent = formatDifference(
            new Date(),
            new Date(contest.endAt),
          );
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
      <div className="justify-self-center">
        <span ref={diffRef}>
          {contest && formatDifference(new Date(), new Date(contest.endAt))}
        </span>
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
