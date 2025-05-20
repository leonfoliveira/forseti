import { Button } from "@/app/_component/form/button";
import { ContestsTable } from "@/app/root/contests/_component/contests-table";
import { Fetcher } from "@/app/_util/fetcher-hook";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { Spinner } from "@/app/_component/spinner";

type Props = {
  onNewContest: () => void;
  contestsFetcher: Fetcher<ContestShortResponseDTO[]>;
};

export function ContestsDashboard(props: Props) {
  const { onNewContest, contestsFetcher } = props;

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center">
          <h1 className="text-2xl inline-block mr-3">Contests</h1>
          {contestsFetcher.isLoading && <Spinner />}
        </div>
        <Button type="button" onClick={onNewContest}>
          New
        </Button>
      </div>
      <ContestsTable contestsFetcher={contestsFetcher} />
    </div>
  );
}
