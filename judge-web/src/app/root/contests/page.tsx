"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/app/_component/spinner";
import { Button } from "@/app/_component/form/button";
import { ContestsTable } from "@/app/root/contests/_component/contests-table";
import { useFindAllContestsAction } from "@/app/_action/find-all-contests-action";

export default function RootContestsPage() {
  const findAllContestsAction = useFindAllContestsAction();
  const router = useRouter();

  useEffect(() => {
    findAllContestsAction.act();
  }, []);

  function onNewContest() {
    router.push("/root/contests/new");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center">
          <h1 className="text-2xl inline-block mr-3">Contests</h1>
          {findAllContestsAction.isLoading && <Spinner data-testid="spinner" />}
        </div>
        <Button
          type="button"
          onClick={onNewContest}
          className="btn-primary"
          data-testid="new"
        >
          New
        </Button>
      </div>
      <ContestsTable contests={findAllContestsAction.data || []} />
    </div>
  );
}
