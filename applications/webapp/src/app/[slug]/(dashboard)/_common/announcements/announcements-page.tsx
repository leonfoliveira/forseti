import { MegaphoneIcon, PlusIcon } from "lucide-react";
import React from "react";

import { AnnouncementsPageCard } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page-card";
import { AnnouncementsPageForm } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page-form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
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
import { useAppSelector } from "@/app/_store/store";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.page-title",
    defaultMessage: "Forseti - Announcements",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.page-description",
    defaultMessage: "View and create contest announcements.",
  },
  newLabel: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.new-label",
    defaultMessage: "New Announcement",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.create-success",
    defaultMessage: "Announcement created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.create-error",
    defaultMessage: "Failed to create announcement",
  },
  emptyTitle: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.empty-title",
    defaultMessage: "No announcements yet",
  },
  emptyDescription: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.empty-description",
    defaultMessage: "Announcements will appear here once created.",
  },
  guidanceText: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.guidance-text",
    defaultMessage:
      "This page displays important contest announcements from judges and organizers. Announcements may include contest updates, clarifications that affect all contestants, schedule changes, or other important information.",
  },
});

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
    <Page title={messages.pageTitle} description={messages.pageDescription}>
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
            <FormattedMessage {...messages.newLabel} />
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
              <EmptyTitle>
                <FormattedMessage {...messages.emptyTitle} />
              </EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              <FormattedMessage {...messages.emptyDescription} />
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
            <FormattedMessage {...messages.guidanceText} />
          </AlertDescription>
        </Alert>
      </div>
    </Page>
  );
}
