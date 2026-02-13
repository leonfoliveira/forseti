import { ChevronDown, ChevronUp, Download, Plus, Trash } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { Button } from "@/app/_lib/component/shadcn/button";
import { CardContent } from "@/app/_lib/component/shadcn/card";
import { Input } from "@/app/_lib/component/shadcn/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@/app/_lib/component/shadcn/item";
import { attachmentReader } from "@/config/composition";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  titleLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.title-label",
    defaultMessage: "Title",
  },
  titleDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.title-description",
    defaultMessage: "The title of the problem.",
  },
  descriptionLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.description-label",
    defaultMessage: "Description (PDF)",
  },
  descriptionDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.description-description",
    defaultMessage: "The problem description file in PDF format.",
  },
  timeLimitLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.time-limit-label",
    defaultMessage: "Time Limit (ms)",
  },
  timeLimitDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.time-limit-description",
    defaultMessage: "The maximum time allowed for the problem.",
  },
  memoryLimitLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.memory-limit-label",
    defaultMessage: "Memory Limit (MB)",
  },
  memoryLimitDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.memory-limit-description",
    defaultMessage: "The maximum memory allowed for the problem.",
  },
  testCasesLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.test-cases-label",
    defaultMessage: "Test Cases (CSV)",
  },
  testCasesDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.test-cases-description",
    defaultMessage:
      "The test cases file in CSV format with two columns: input and expected output.",
  },
  newProblemLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-problems-tab.new-problem-label",
    defaultMessage: "New Problem",
  },
});

type Props = {
  contest: ContestFullResponseDTO;
  form: UseFormReturn<SettingsFormType>;
};

export function SettingsPageProblemsTab({ contest, form }: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "problems",
  });

  return (
    <CardContent
      className="flex flex-col gap-4"
      data-testid="settings-problems-tab"
    >
      {fields.map((field, index) => (
        <Item key={field.id} variant="outline" data-testid="problem-item">
          <ItemMedia>
            <Badge className="font-md text-lg" data-testid="problem-letter">
              {String.fromCharCode(65 + index)}
            </Badge>
          </ItemMedia>
          <ItemContent>
            <div className="grid grid-cols-2 gap-3">
              <ControlledField
                className="col-span-2"
                form={form}
                name={`problems.${index}.title`}
                label={messages.titleLabel}
                field={<Input data-testid="problem-title" />}
                description={messages.titleDescription}
              />

              <ControlledField
                form={form}
                name={`problems.${index}.timeLimit`}
                label={messages.timeLimitLabel}
                field={
                  <Input
                    type="number"
                    step="500"
                    data-testid="problem-time-limit"
                  />
                }
                description={messages.timeLimitDescription}
              />

              <ControlledField
                form={form}
                name={`problems.${index}.memoryLimit`}
                label={messages.memoryLimitLabel}
                field={
                  <Input
                    type="number"
                    step="500"
                    data-testid="problem-memory-limit"
                  />
                }
                description={messages.memoryLimitDescription}
              />

              <div>
                <ControlledField
                  form={form}
                  name={`problems.${index}.newDescription`}
                  label={messages.descriptionLabel}
                  field={
                    <Input
                      type="file"
                      accept="application/pdf"
                      data-testid="problem-description"
                    />
                  }
                  description={messages.descriptionDescription}
                />

                {field.description && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2 w-full justify-start"
                    title={field.description.filename}
                    onClick={() =>
                      attachmentReader.download(contest.id, field.description)
                    }
                    data-testid="problem-description-download"
                  >
                    <Download />
                    <span className="truncate underline">
                      {field.description.filename}
                    </span>
                  </Button>
                )}
              </div>

              <div>
                <ControlledField
                  form={form}
                  name={`problems.${index}.newTestCases`}
                  label={messages.testCasesLabel}
                  field={
                    <Input
                      type="file"
                      accept="text/csv"
                      data-testid="problem-test-cases"
                    />
                  }
                  description={messages.testCasesDescription}
                />

                {field.testCases && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2 w-full justify-start"
                    title={field.testCases.filename}
                    onClick={() =>
                      attachmentReader.download(contest.id, field.testCases)
                    }
                    data-testid="problem-test-cases-download"
                  >
                    <Download />
                    <span className="truncate underline">
                      {field.testCases.filename}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </ItemContent>
          <ItemActions>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                data-testid="move-problem-up-button"
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                data-testid="move-problem-down-button"
              >
                <ChevronDown />
              </Button>
              <Button
                type="button"
                className="mt-5"
                size="sm"
                variant="destructive"
                onClick={() => remove(index)}
                data-testid="remove-problem-button"
              >
                <Trash />
              </Button>
            </div>
          </ItemActions>
        </Item>
      ))}
      <Button
        type="button"
        onClick={() =>
          append({
            title: "",
            timeLimit: "1000",
            memoryLimit: "1024",
          } as any)
        }
        data-testid="add-problem-button"
      >
        <Plus />
        <FormattedMessage {...messages.newProblemLabel} />
      </Button>
    </CardContent>
  );
}
