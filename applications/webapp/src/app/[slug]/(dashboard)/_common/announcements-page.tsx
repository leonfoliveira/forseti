import { joiResolver } from "@hookform/resolvers/joi";
import React from "react";
import { useForm } from "react-hook-form";

import { AnnouncementFormType } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form";
import { AnnouncementFormMap } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form-map";
import { announcementFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form-schema";
import { FormField } from "@/app/_lib/component/form/form-field";
import { FormattedDateTime } from "@/app/_lib/component/format/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from "@/app/_lib/heroui-wrapper";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
import { announcementWritter } from "@/config/composition";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.announcements-page.page-title",
    defaultMessage: "Forseti - Announcements",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.announcements-page.page-description",
    defaultMessage: "View and create contest announcements.",
  },
  createTitle: {
    id: "app.[slug].(dashboard)._common.announcements-page.create-title",
    defaultMessage: "Create Announcement",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.announcements-page.create-success",
    defaultMessage: "Announcement created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.announcements-page.create-error",
    defaultMessage: "Failed to create announcement",
  },
  textLabel: {
    id: "app.[slug].(dashboard)._common.announcements-page.text-label",
    defaultMessage: "Text",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.announcements-page.submit-label",
    defaultMessage: "Submit",
  },
  empty: {
    id: "app.[slug].(dashboard)._common.announcements-page.empty",
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
        {canCreate && (
          <>
            <Card
              className="max-w-4xl w-full mb-6"
              data-testid="announcement-form"
            >
              <CardHeader>
                <h3
                  className="text-lg font-semibold"
                  data-testid="announcement-form-title"
                >
                  <FormattedMessage {...messages.createTitle} />
                </h3>
              </CardHeader>
              <Divider />
              <CardBody>
                <form
                  onSubmit={form.handleSubmit(createAnnouncement)}
                  className="space-y-4"
                >
                  <FormField form={form} name="text">
                    <Input
                      label={<FormattedMessage {...messages.textLabel} />}
                      data-testid="announcement-form-text"
                    />
                  </FormField>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={createAnnouncementState.isLoading}
                      data-testid="announcement-form-submit"
                    >
                      <FormattedMessage {...messages.submitLabel} />
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
            <Divider className="mb-5" />
          </>
        )}
        {announcements.length == 0 && (
          <Card className="max-w-4xl w-full" data-testid="empty">
            <CardBody>
              <p className="text-neutral-content text-center my-10 text-foreground-400">
                <FormattedMessage {...messages.empty} />
              </p>
            </CardBody>
          </Card>
        )}
        <div className="space-y-5 max-w-4xl w-full">
          {announcements.toReversed().map((announcement) => (
            <Card key={announcement.id} data-testid="announcement">
              <CardBody>
                <div className="w-full flex justify-between">
                  <div>
                    <p
                      className="font-semibold text-sm"
                      data-testid="announcement-member-name"
                    >
                      {announcement.member.name}
                    </p>
                  </div>
                  <p
                    className="text-xs text-default-400"
                    data-testid="announcement-created-at"
                  >
                    <FormattedDateTime timestamp={announcement.createdAt} />
                  </p>
                </div>
                <p className="mt-3" data-testid="announcement-text">
                  {announcement.text}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
