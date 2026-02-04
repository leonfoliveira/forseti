import { UseFormReturn } from "react-hook-form";

import { SubmissionJudgeFormType } from "@/app/[slug]/(dashboard)/_common/_form/submission-judge-form";
import { Form } from "@/app/_lib/component/base/form/form";
import { Select } from "@/app/_lib/component/base/form/select";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { useIntl } from "@/app/_lib/util/intl-hook";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  answerLabel: {
    id: "app.[slug].(dashboard)._common.submissions.judge-submission-form.answer-label",
    defaultMessage: "Answer",
  },
  judgeBody: {
    id: "app.[slug].(dashboard)._common.submissions.judge-submission-form.judge-body",
    defaultMessage: "Are you sure you want to judge this submission?",
  },
});

type Props = {
  form: UseFormReturn<SubmissionJudgeFormType>;
};

export function JudgeSubmissionForm({ form }: Props) {
  const intl = useIntl();

  return (
    <Form>
      <Form.Field form={form} name="answer">
        <Select
          className="mb-5"
          label={<FormattedMessage {...messages.answerLabel} />}
        >
          {Object.keys(SubmissionAnswer)
            .filter((it) => it !== SubmissionAnswer.NO_ANSWER)
            .map((key) => (
              <Select.Item key={key}>
                {intl.formatMessage(
                  globalMessages.submissionAnswer[key as SubmissionAnswer],
                )}
              </Select.Item>
            ))}
        </Select>
      </Form.Field>
      <FormattedMessage {...messages.judgeBody} />
    </Form>
  );
}
