import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";

import { AnnouncementFormType } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form";
import { AnnouncementFormMap } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form-map";
import { announcementFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form-schema";
import { AnnouncementCard } from "@/app/[slug]/(dashboard)/_common/announcements/announcement-card";
import { CreateAnnouncementForm } from "@/app/[slug]/(dashboard)/_common/announcements/create-announcement-form";
import { EmptyAnnouncementDisplay } from "@/app/[slug]/(dashboard)/_common/announcements/empty-announcement-display";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { Metadata } from "@/app/_lib/component/metadata";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
import { announcementWritter } from "@/config/composition";
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
  createSuccess: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.create-success",
    defaultMessage: "Announcement created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.create-error",
    defaultMessage: "Failed to create announcement",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page.empty",
    defaultMessage: "No announcements yet",
  },
});

type Props = {
  contestId: string;
  announcements: AnnouncementResponseDTO[];
  canCreate?: boolean;
};

/**
 * Displays the announcements page where users can view and create announcements.
 **/
export function AnnouncementsPage({
  contestId,
  announcements,
  canCreate = false,
}: Props) {
  const createAnnouncementState = useLoadableState();
  const toast = useToast();

  const form = useForm<AnnouncementFormType>({
    resolver: joiResolver(announcementFormSchema),
    defaultValues: AnnouncementFormMap.getDefault(),
  });

  async function createAnnouncement(data: AnnouncementFormType) {
    createAnnouncementState.start();
    try {
      await announcementWritter.create(
        contestId,
        AnnouncementFormMap.toInputDTO(data),
      );
      createAnnouncementState.finish();
      form.reset();
      toast.success(messages.createSuccess);
    } catch (error) {
      createAnnouncementState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <div className="flex flex-col items-center">
        {/* Create Form */}
        {canCreate && (
          <>
            <CreateAnnouncementForm
              form={form}
              onSubmit={createAnnouncement}
              isLoading={createAnnouncementState.isLoading}
            />
            <Divider className="mb-5" />
          </>
        )}

        {/* Empty State */}
        {announcements.length == 0 && <EmptyAnnouncementDisplay />}

        {/* Items */}
        {announcements.length > 0 && (
          <div className="w-full max-w-4xl space-y-5">
            {announcements.toReversed().map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
