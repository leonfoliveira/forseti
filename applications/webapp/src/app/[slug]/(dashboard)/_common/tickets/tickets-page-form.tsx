import { joiResolver } from "@hookform/resolvers/joi";
import { SendIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import {
  TicketForm,
  TicketFormType,
} from "@/app/[slug]/(dashboard)/_common/tickets/ticket-form";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/_lib/component/shadcn/native-select";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Textarea } from "@/app/_lib/component/shadcn/textarea";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  createTitle: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.create-title",
    defaultMessage: "Create Ticket",
  },
  createDescription: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.create-description",
    defaultMessage: "Fill out the form below to create a new ticket.",
  },
  createSuccess: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.create-success",
    defaultMessage: "Ticket created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.create-error",
    defaultMessage: "Failed to create ticket",
  },
  typeLabel: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.type-label",
    defaultMessage: "Type",
  },
  descriptionLabel: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.description-label",
    defaultMessage: "Description",
  },
  cancelLabel: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.cancel-label",
    defaultMessage: "Cancel",
  },
  submitLabel: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page-form.submit-label",
    defaultMessage: "Submit",
  },
});

type Props = {
  onCreate: (ticket: TicketResponseDTO) => void;
  onClose: () => void;
};

export function TicketsPageForm({ onCreate, onClose }: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const createTicketState = useLoadableState();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<TicketFormType>({
    resolver: joiResolver(TicketForm.schema),
    defaultValues: TicketForm.getDefault(),
  });

  async function createTicket(data: TicketFormType) {
    console.debug("Creating ticket with data:", data);
    createTicketState.start();

    try {
      const newTicket = await Composition.ticketWritter.create(
        contestId,
        TicketForm.toRequestDTO(data),
      );

      toast.success(messages.createSuccess);
      onCreate(newTicket);
      form.reset();
      formRef.current?.reset();
      createTicketState.finish();
      console.debug("Ticket created successfully:", newTicket);

      onClose();
    } catch (error) {
      await createTicketState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  return (
    <Card className="w-full max-w-4xl" data-testid="ticket-form">
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
        <Form ref={formRef} onSubmit={form.handleSubmit(createTicket)}>
          <FieldSet disabled={createTicketState.isLoading}>
            <ControlledField
              form={form}
              name="type"
              label={messages.typeLabel}
              field={
                <NativeSelect data-testid="ticket-form-type">
                  <NativeSelectOption value="" />
                  {[
                    TicketType.TECHNICAL_SUPPORT,
                    TicketType.NON_TECHNICAL_SUPPORT,
                  ].map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      <FormattedMessage
                        {...globalMessages.ticketType[type as TicketType]}
                      />
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />

            <ControlledField
              form={form}
              name="description"
              label={messages.descriptionLabel}
              field={<Textarea data-testid="ticket-form-description" />}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="ticket-form-cancel"
              >
                <FormattedMessage {...messages.cancelLabel} />
              </Button>
              <AsyncButton
                type="submit"
                icon={<SendIcon size={16} />}
                isLoading={createTicketState.isLoading}
                data-testid="ticket-form-submit"
              >
                <FormattedMessage {...messages.submitLabel} />
              </AsyncButton>
            </div>
          </FieldSet>
        </Form>
      </CardContent>
    </Card>
  );
}
