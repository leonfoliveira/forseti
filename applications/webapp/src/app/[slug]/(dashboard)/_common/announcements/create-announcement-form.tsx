import { UseFormReturn } from "react-hook-form";

import { AnnouncementFormType } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form";
import { Card } from "@/app/_lib/component/base/display/card";
import { Button } from "@/app/_lib/component/base/form/button";
import { Form } from "@/app/_lib/component/base/form/form";
import { Input } from "@/app/_lib/component/base/form/input";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  createTitle: {
    id: "app.[slug].(dashboard)._common.announcements.create-announcement-form.create-title",
    defaultMessage: "Create Announcement",
  },
  textLabel: {
    id: "app.[slug].(dashboard)._common.announcements.create-announcement-form.text-label",
    defaultMessage: "Text",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.announcements.create-announcement-form.submit-label",
    defaultMessage: "Submit",
  },
});

type Props = {
  form: UseFormReturn<AnnouncementFormType>;
  onSubmit: (data: AnnouncementFormType) => Promise<void>;
  isLoading?: boolean;
};

export function CreateAnnouncementForm({ form, onSubmit, isLoading }: Props) {
  return (
    <Card className="max-w-4xl w-full mb-6" data-testid="announcement-form">
      <Card.Header>
        <h3
          className="text-lg font-semibold"
          data-testid="announcement-form-title"
        >
          <FormattedMessage {...messages.createTitle} />
        </h3>
      </Card.Header>
      <Divider />
      <Card.Body>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Form.Field form={form} name="text">
            <Input
              label={<FormattedMessage {...messages.textLabel} />}
              data-testid="announcement-form-text"
            />
          </Form.Field>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              data-testid="announcement-form-submit"
            >
              <FormattedMessage {...messages.submitLabel} />
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
