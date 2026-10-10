import { joiResolver } from "@hookform/resolvers/joi";
import { SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  AnnouncementForm,
  AnnouncementFormType,
} from "@/app/[slug]/(dashboard)/_common/announcements/AnnouncementForm";
import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Form } from "@/app/_lib/component/form/Form";
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
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { Composition } from "@/config/composition";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";

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

      toast.success("Announcement created successfully");
      onCreate(newAnnouncement);
      form.reset();
      createAnnouncementState.finish();
      console.debug("Announcement created successfully:", newAnnouncement);

      onClose();
    } catch (error) {
      await createAnnouncementState.fail(error, {
        default: () => toast.error("Failed to create announcement"),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="announcement-form">
      <CardHeader>
        <CardTitle>Create Announcement</CardTitle>
        <CardDescription>
          Write and broadcast a new announcement to all participants.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <Form onSubmit={form.handleSubmit(createAnnouncement)}>
          <FieldSet disabled={createAnnouncementState.isLoading}>
            <ControlledField
              form={form}
              name="text"
              label="Text"
              field={<Textarea data-testid="announcement-form-text" />}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="announcement-form-cancel"
              >
                Cancel
              </Button>
              <AsyncButton
                type="submit"
                icon={<SendIcon size={16} />}
                isLoading={createAnnouncementState.isLoading}
                data-testid="announcement-form-submit"
              >
                Broadcast
              </AsyncButton>
            </div>
          </FieldSet>
        </Form>
      </CardContent>
    </Card>
  );
}
