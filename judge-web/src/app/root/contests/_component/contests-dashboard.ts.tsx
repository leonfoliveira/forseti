import { Button } from "@/app/_component/form/button";
import { ContestsTable } from "@/app/root/contests/_component/contests-table";
import { Fetcher } from "@/app/_util/fetcher-hook";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";

type Props = {
  onNewContest: () => void;
  contestsFetcher: Fetcher<ContestShortResponseDTO[]>;
};

export function ContestsDashboard(props: Props) {
  const { onNewContest, contestsFetcher } = props;

  return (
    <div>
      <div>
        <h1>Contests</h1>
        <Button type="button" onClick={onNewContest}>
          New
        </Button>
      </div>
      <ContestsTable contestsFetcher={contestsFetcher} />
    </div>
  );
}
