import { MegaphoneIcon, PlusIcon } from "lucide-react";
import React from "react";

import { AnnouncementsPageCard } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPageCard";
import { AnnouncementsPageForm } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPageForm";
import { Page } from "@/app/_lib/component/page/Page";
import { Alert, AlertDescription } from "@/app/_lib/component/shadcn/alert";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/app/_lib/component/shadcn/empty";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useAppSelector } from "@/app/_lib/store/Store";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";

type Props = {
  announcements: AnnouncementResponseDTO[];
} & (
  | {
      canCreate: true;
      onCreate: (announcement: AnnouncementResponseDTO) => void;
    }
  | {
      canCreate?: false;
      onCreate?: (announcement: AnnouncementResponseDTO) => void;
    }
);

/**
 * Displays the announcements page where users can view and create announcements.
 **/
export function AnnouncementsPage({
  announcements,
  canCreate = false,
  onCreate,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  return (
    <Page
      title="Forseti - Announcements"
      description="View and create contest announcements."
    >
      <div className="flex flex-col items-center py-5">
        {/* Create Form */}
        {canCreate && onCreate && isCreateFormOpen && (
          <AnnouncementsPageForm
            contestId={contestId}
            onClose={() => setIsCreateFormOpen(false)}
            onCreate={onCreate}
          />
        )}
        {canCreate && !isCreateFormOpen && (
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <PlusIcon size={16} />
            New Announcement
          </Button>
        )}
        {canCreate && <Separator className="my-5 w-full max-w-4xl" />}

        {/* Empty State */}
        {announcements.length == 0 && (
          <Empty data-testid="empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MegaphoneIcon size={48} />
              </EmptyMedia>
              <EmptyTitle>No announcements yet</EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              Announcements will appear here once created.
            </EmptyDescription>
          </Empty>
        )}

        {/* Items */}
        {announcements.length > 0 && (
          <div
            className="w-full max-w-4xl space-y-5"
            data-testid="announcements-list"
          >
            {announcements.toReversed().map((announcement) => (
              <AnnouncementsPageCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        )}

        <Alert className="bg-card mt-5 w-full max-w-4xl py-2">
          <AlertDescription className="text-xs">
            This page displays important contest announcements from judges and
            organizers. Announcements may include contest updates,
            clarifications that affect all contestants, schedule changes, or
            other important information.
          </AlertDescription>
        </Alert>
      </div>
    </Page>
  );
}
