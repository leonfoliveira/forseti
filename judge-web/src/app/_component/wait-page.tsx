import React from "react";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/ContestMetadataResponseDTO";
import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";
import { useRouter } from "next/navigation";

type Props = {
  metadata: ContestMetadataResponseDTO;
};

export function WaitPage({ metadata }: Props) {
  const router = useRouter();
  const clockRef = useWaitClock(new Date(metadata.startAt), () =>
    router.push(`/auth/contests/${metadata.slug}`),
  );

  return (
    <div className="h-dvh flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl mb-5" data-testid="not-started:title">
          {metadata.title}
        </h1>
        <p className="font-semibold">Starts at</p>
        <p data-testid="not-started:start-at">
          <span ref={clockRef} />
        </p>
      </div>
    </div>
  );
}
