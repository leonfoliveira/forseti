import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";

import { ClarificationFormType } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form";
import { ClarificationFormMap } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-map";
import { clarificationFormSchema } from "@/app/[slug]/(dashboard)/_common/_form/clarification-form-schema";
import { Button } from "@/app/_lib/component/base/form/button";
import { Form } from "@/app/_lib/component/base/form/form";
import { Input } from "@/app/_lib/component/base/form/input";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
import { clarificationWritter } from "@/config/composition";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  createSuccess: {
    id: "app.[slug].(dashboard)._common.clarifications.answer-clarification-form.create-success",
    defaultMessage: "Clarification created successfully",
  },
  createError: {
    id: "app.[slug].(dashboard)._common.clarifications.answer-clarification-form.create-error",
    defaultMessage: "Failed to create clarification",
  },
  answerLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.answer-clarification-form.answer-label",
    defaultMessage: "Answer",
  },
});

type Props = {
  contestId: string;
  parentId: string;
};

export function AnswerClarificationForm({ contestId, parentId }: Props) {
  const createClarificationState = useLoadableState();
  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
    defaultValues: ClarificationFormMap.getDefault(),
  });
  const toast = useToast();

  async function createClarification(data: ClarificationFormType) {
    createClarificationState.start();
    try {
      await clarificationWritter.create(contestId, {
        ...ClarificationFormMap.toInputDTO(data),
        parentId,
      });
      createClarificationState.finish();
      form.reset();
      toast.success(messages.createSuccess);
    } catch (error) {
      createClarificationState.fail(error, {
        default: () => toast.error(messages.createError),
      });
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(createClarification)}
      className="w-full"
      data-testid="answer-form"
    >
      <div className="flex w-full">
        <Form.Field form={form} name="text">
          <Input data-testid="answer-form-text" />
        </Form.Field>
        <Button
          type="submit"
          color="primary"
          className="ml-2"
          isLoading={createClarificationState.isLoading}
          data-testid="answer-form-submit"
        >
          <FormattedMessage {...messages.answerLabel} />
        </Button>
      </div>
    </form>
  );
}
