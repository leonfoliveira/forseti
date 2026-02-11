import { Megaphone, Plus } from "lucide-react";
import React from "react";

import { AnnouncementsPageCard } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page-card";
import { AnnouncementsPageForm } from "@/app/[slug]/(dashboard)/_common/announcements/announcements-page-form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
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
});

type Props = {
  announcements: AnnouncementResponseDTO[];
  canCreate?: boolean;
};

/**
 * Displays the announcements page where users can view and create announcements.
 **/
export function AnnouncementsPage({ announcements, canCreate = false }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-col items-center">
        {/* Create Form */}
        {canCreate && isCreateFormOpen && (
          <AnnouncementsPageForm
            contestId={contestId}
            onClose={() => setIsCreateFormOpen(false)}
          />
        )}
        {canCreate && !isCreateFormOpen && (
          <Button
            className="mb-5"
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <Plus size={16} />
            <FormattedMessage {...messages.newLabel} />
          </Button>
        )}
        {canCreate && <Separator className="my-5 w-full max-w-4xl" />}

        {/* Empty State */}
        {announcements.length == 0 && (
          <Empty data-testid="empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Megaphone size={48} />
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
          <div className="w-full max-w-4xl space-y-5">
            {announcements.toReversed().map((announcement) => (
              <AnnouncementsPageCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
