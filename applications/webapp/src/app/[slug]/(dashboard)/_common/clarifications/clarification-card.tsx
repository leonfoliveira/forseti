import { TrashIcon } from "@heroicons/react/24/solid";

import { AnswerClarificationForm } from "@/app/[slug]/(dashboard)/_common/clarifications/answer-clarification-form";
import { Card } from "@/app/_lib/component/base/display/card";
import { Button } from "@/app/_lib/component/base/form/button";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedDateTime } from "@/app/_lib/component/format/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  headerProblem: {
    id: "app.[slug].(dashboard)._common.clarifications.clarification-card.header-problem",
    defaultMessage: "Problem {letter}",
  },
  headerGeneral: {
    id: "app.[slug].(dashboard)._common.clarifications.clarification-card.header-general",
    defaultMessage: "General",
  },
  answerLabel: {
    id: "app.[slug].(dashboard)._common.clarifications.clarification-card.answer-label",
    defaultMessage: "Answer",
  },
  headerAnswer: {
    id: "app.[slug].(dashboard)._common.clarifications.clarification-card.header-answer",
    defaultMessage: "Re: {judge}",
  },
});

type Props = {
  contestId: string;
  clarification: ClarificationResponseDTO;
  canAnswer?: boolean;
  onDelete: (id: string) => Promise<void>;
};

export function ClarificationCard({
  contestId,
  clarification,
  canAnswer,
  onDelete,
}: Props) {
  return (
    <Card
      key={clarification.id}
      className="max-w-4xl w-full"
      data-testid="clarification"
    >
      <Card.Body>
        <div className="w-full flex justify-between">
          <div>
            <p
              className="font-semibold text-sm"
              data-testid="clarification-member-name"
            >
              {clarification.member.name}
            </p>
            <p
              className="text-xs text-foreground-400"
              data-testid="clarification-problem"
            >
              {clarification.problem ? (
                <FormattedMessage
                  {...messages.headerProblem}
                  values={{
                    letter: clarification.problem.letter,
                  }}
                />
              ) : (
                <FormattedMessage {...messages.headerGeneral} />
              )}
            </p>
          </div>
          <div className="flex items-center">
            <p
              className="text-xs text-default-400"
              data-testid="clarification-created-at"
            >
              <FormattedDateTime timestamp={clarification.createdAt} />
            </p>
            {canAnswer && (
              <Button
                isIconOnly
                color="danger"
                variant="light"
                size="sm"
                onPress={() => onDelete(clarification.id)}
                className="lg:-col-end-1"
                data-testid="delete-button"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-3" data-testid="clarification-text">
          {clarification.text}
        </p>
      </Card.Body>
      {clarification.children.length === 0 && canAnswer && (
        <>
          <Divider />
          <Card.Footer>
            <AnswerClarificationForm
              contestId={contestId}
              parentId={clarification.id}
            />
          </Card.Footer>
        </>
      )}
      {clarification.children.length > 0 && (
        <>
          <Divider />
          <Card.Footer>
            <div className="w-full flex flex-col">
              <div className="w-full flex justify-between">
                <div>
                  <p
                    className="font-semibold text-sm"
                    data-testid="answer-member-name"
                  >
                    <FormattedMessage
                      {...messages.headerAnswer}
                      values={{
                        judge: clarification.children[0].member.name,
                      }}
                    />
                  </p>
                </div>
                <p
                  className="text-xs text-default-400"
                  data-testid="answer-created-at"
                >
                  <FormattedDateTime
                    timestamp={clarification.children[0].createdAt}
                  />
                </p>
              </div>
              <p className="mt-3" data-testid="answer-text">
                {clarification.children[0].text}
              </p>
            </div>
          </Card.Footer>
        </>
      )}
    </Card>
  );
}
