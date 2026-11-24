import { MegaphoneIcon, PlusIcon } from "lucide-react";
import React from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
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
import { AnnouncementsPageCard } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPageCard";
import { AnnouncementsPageForm } from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementsPageForm";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";

type Props = {
  announcements: AnnouncementResponseDTO[];
  onCreate?: (announcement: AnnouncementResponseDTO) => void;
};

/**
 * Displays the announcements page where users can view and create announcements.
 **/
export function AnnouncementsPage({ announcements, onCreate }: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  const canCreate = !!onCreate;

  return (
    <Page
      title="[slug].(dashboard)._common.announcements.AnnouncementsPage.pageTitle"
      description="[slug].(dashboard)._common.announcements.AnnouncementsPage.pageDescription"
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
            <FormattedMessage id="[slug].(dashboard)._common.announcements.AnnouncementsPage.newAnnouncement" />
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
                <FormattedMessage id="[slug].(dashboard)._common.announcements.AnnouncementsPage.emptyTitle" />
              </EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              <FormattedMessage id="[slug].(dashboard)._common.announcements.AnnouncementsPage.emptyDescription" />
            </EmptyDescription>
          </Empty>
        )}

        {/* Items */}
        {announcements.length > 0 && (
          <div
            className="w-full max-w-4xl space-y-5"
            data-testid="announcements-list"
          >
            {announcements
              .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((announcement) => (
                <AnnouncementsPageCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
          </div>
        )}

        <Alert className="bg-card mt-5 w-full max-w-4xl py-2">
          <AlertDescription className="text-xs">
            <FormattedMessage id="[slug].(dashboard)._common.announcements.AnnouncementsPage.help" />
          </AlertDescription>
        </Alert>
      </div>
    </Page>
  );
}
