import { joiResolver } from "@hookform/resolvers/joi";
import { SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  AnnouncementForm,
  AnnouncementFormType,
} from "@/app/[slug]/(dashboard)/_common/announcements/announcement-form";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { Form } from "@/app/_lib/component/form/form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_lib/component/shadcn/card";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Textarea } from "@/app/_lib/component/shadcn/textarea";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { Composition } from "@/config/composition";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  createTitle: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page-form.create-title",
    defaultMessage: "Create announcement",
  },
  createDescription: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page-form.create-description",
    defaultMessage:
      "Write and broadcast a new announcement to all participants.",
  },
  textLabel: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page-form.text-label",
    defaultMessage: "Message",
  },
  cancelLabel: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page-form.cancel-label",
    defaultMessage: "Cancel",
  },
  broadcastLabel: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page-form.broadcast-label",
    defaultMessage: "Broadcast",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page-form.create-success",
    defaultMessage: "Announcement created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.announcements.announcements-page-form.create-error",
    defaultMessage: "Failed to create announcement",
  },
});

type Props = {
  contestId: string;
  onCreate: (announcement: AnnouncementResponseDTO) => void;
  onClose: () => void;
};

export function AnnouncementsPageForm({ contestId, onCreate, onClose }: Props) {
  const createAnnouncementState = useLoadableState();
  const toast = useToast();

  const form = useForm<AnnouncementFormType>({
    resolver: joiResolver(AnnouncementForm.schema),
    defaultValues: AnnouncementForm.getDefault(),
  });

  async function createAnnouncement(data: AnnouncementFormType) {
    console.debug("Creating announcement with data:", data);
    createAnnouncementState.start();

    try {
      const newAnnouncement = await Composition.announcementWritter.create(
        contestId,
        AnnouncementForm.toInputDTO(data),
      );

      toast.success(messages.createSuccess);
      onCreate(newAnnouncement);
      form.reset();
      createAnnouncementState.finish();
      console.debug("Announcement created successfully:", newAnnouncement);

      onClose();
    } catch (error) {
      await createAnnouncementState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="announcement-form">
      <CardHeader>
        <CardTitle>
          <FormattedMessage {...messages.createTitle} />
        </CardTitle>
        <CardDescription>
          <FormattedMessage {...messages.createDescription} />
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <Form onSubmit={form.handleSubmit(createAnnouncement)}>
          <FieldSet disabled={createAnnouncementState.isLoading}>
            <ControlledField
              form={form}
              name="text"
              label={messages.textLabel}
              field={<Textarea data-testid="announcement-form-text" />}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="announcement-form-cancel"
              >
                <FormattedMessage {...messages.cancelLabel} />
              </Button>
              <AsyncButton
                type="submit"
                icon={<SendIcon size={16} />}
                isLoading={createAnnouncementState.isLoading}
                data-testid="announcement-form-submit"
              >
                <FormattedMessage {...messages.broadcastLabel} />
              </AsyncButton>
            </div>
          </FieldSet>
        </Form>
      </CardContent>
    </Card>
  );
}
