import { PaperClipIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { Card } from "@/app/_lib/component/base/display/card";
import { Chip } from "@/app/_lib/component/base/display/chip";
import { Alert } from "@/app/_lib/component/base/feedback/alert";
import { Button } from "@/app/_lib/component/base/form/button";
import { FileInput } from "@/app/_lib/component/base/form/file-input";
import { Form } from "@/app/_lib/component/base/form/form";
import { Input } from "@/app/_lib/component/base/form/input";
import { NumberInput } from "@/app/_lib/component/base/form/number-input";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { cls } from "@/app/_lib/util/cls";
import { useAppSelector } from "@/app/_store/store";
import { attachmentReader } from "@/config/composition";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  problemsSectionTitle: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.section-title",
    defaultMessage: "Contest Problems",
  },
  problemsSectionSubtitle: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.section-subtitle",
    defaultMessage:
      "Configure the problems for this contest. Each problem requires a title, description, and test cases.",
  },
  titleLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.title-label",
    defaultMessage: "Title",
  },
  titleDescription: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.title-description",
    defaultMessage: "A clear, descriptive name for the problem",
  },
  descriptionLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.description-label",
    defaultMessage: "Description",
  },
  descriptionFileDescription: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.description-file-description",
    defaultMessage: "Upload a PDF or text file with the problem statement",
  },
  timeLimitLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.time-limit-label",
    defaultMessage: "Time Limit",
  },
  timeLimitDescription: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.time-limit-description",
    defaultMessage: "Maximum execution time per test case",
  },
  memoryLimitLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.memory-limit-label",
    defaultMessage: "Memory Limit",
  },
  memoryLimitDescription: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.memory-limit-description",
    defaultMessage: "Maximum memory usage per test case",
  },
  testCasesLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.test-cases-label",
    defaultMessage: "Test Cases",
  },
  testCasesDescription: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.test-cases-description",
    defaultMessage: "Upload a CSV file with input/output test cases",
  },
  currentFileLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.current-file-label",
    defaultMessage: "Current: {filename}",
  },
  newLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.new-label",
    defaultMessage: "New Problem",
  },
  problemHeaderSubtitle: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.problem-header-subtitle",
    defaultMessage: "Configure problem details and constraints",
  },
  executionConstraintsTitle: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.execution-constraints-title",
    defaultMessage: "Execution Constraints",
  },
  emptyStateTitle: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.empty-state-title",
    defaultMessage: "No Problems Added Yet",
  },
  emptyStateDescription: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.empty-state-description",
    defaultMessage:
      "Start by adding your first problem. Each problem should include a clear title, description, test cases, and execution constraints.",
  },
  addFirstProblemLabel: {
    id: "app.[slug].(dashboard).settings._tab.problems-settings.add-first-problem-label",
    defaultMessage: "Add First Problem",
  },
});

type Props = {
  form: UseFormReturn<SettingsForm>;
  isOpen: boolean;
};

/**
 * Displays the problems settings tab within the admin dashboard.
 * Allows administrators to configure the problems for the contest.
 */
export function ProblemsSettings({ form, isOpen }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "problems",
  });

  return (
    <div
      className={cls("flex flex-col gap-8 p-6", !isOpen && "hidden")}
      data-testid="problems-settings"
    >
      {/* Header Section */}
      <div className="space-y-2">
        <h3 className="text-foreground/90 text-lg font-semibold">
          <FormattedMessage {...messages.problemsSectionTitle} />
        </h3>
        <p className="text-foreground/60 mt-1 text-sm">
          <FormattedMessage {...messages.problemsSectionSubtitle} />
        </p>
      </div>

      {/* Problems List */}
      {fields.length > 0 ? (
        <div className="flex flex-col gap-8">
          {fields.map((problem, index) => (
            <Card key={problem.id} data-testid="problem">
              {/* Problem Header */}
              <Card.Header>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Chip
                      color="primary"
                      variant="flat"
                      className="px-4 py-2 text-lg font-semibold"
                      data-testid="problem-index"
                    >
                      {String.fromCharCode(65 + index)}
                    </Chip>
                    <div className="bg-divider h-6 w-px" />
                    <span className="text-foreground/60 text-sm">
                      <FormattedMessage {...messages.problemHeaderSubtitle} />
                    </span>
                  </div>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    size="sm"
                    className="hover:bg-danger/10 transition-colors"
                    onPress={() => remove(index)}
                    data-testid="remove-problem"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Card.Header>

              {/* Problem Configuration */}
              <Card.Body>
                <div className="grid grid-cols-1 gap-6">
                  {/* Title */}
                  <Form.Field form={form} name={`problems.${index}.title`}>
                    <Input
                      label={<FormattedMessage {...messages.titleLabel} />}
                      description={
                        <FormattedMessage {...messages.titleDescription} />
                      }
                    />
                  </Form.Field>

                  {/* File Uploads Section */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Form.Field
                        form={form}
                        name={`problems.${index}.newDescription`}
                      >
                        <FileInput
                          label={
                            <FormattedMessage {...messages.descriptionLabel} />
                          }
                          description={
                            <FormattedMessage
                              {...messages.descriptionFileDescription}
                            />
                          }
                          accept=".pdf,.txt,.md"
                          data-testid="description-input"
                        />
                      </Form.Field>
                      {problem.description && (
                        <Alert
                          variant="faded"
                          color="success"
                          icon={<PaperClipIcon width={20} height={20} />}
                          classNames={{ base: "py-1 px-2" }}
                          title={
                            <FormattedMessage
                              {...messages.currentFileLabel}
                              values={{
                                filename: (
                                  <a
                                    key="anchor"
                                    className="cursor-pointer underline"
                                    onClick={() =>
                                      attachmentReader.download(
                                        contestId,
                                        problem.description,
                                      )
                                    }
                                    data-testid="download-description"
                                  >
                                    {problem.description.filename}
                                  </a>
                                ),
                              }}
                            />
                          }
                          data-testid="description-alert"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Form.Field
                        form={form}
                        name={`problems.${index}.newTestCases`}
                      >
                        <FileInput
                          label={
                            <FormattedMessage {...messages.testCasesLabel} />
                          }
                          description={
                            <FormattedMessage
                              {...messages.testCasesDescription}
                            />
                          }
                          accept=".csv"
                          data-testid="test-cases-input"
                        />
                      </Form.Field>
                      {problem.testCases && (
                        <Alert
                          variant="faded"
                          color="success"
                          icon={<PaperClipIcon className="h-5" />}
                          classNames={{ base: "py-1 px-2" }}
                          title={
                            <FormattedMessage
                              {...messages.currentFileLabel}
                              values={{
                                filename: (
                                  <a
                                    key="anchor"
                                    className="cursor-pointer underline"
                                    onClick={() =>
                                      attachmentReader.download(
                                        contestId,
                                        problem.testCases,
                                      )
                                    }
                                    data-testid="download-test-cases"
                                  >
                                    {problem.testCases.filename}
                                  </a>
                                ),
                              }}
                            />
                          }
                          data-testid="test-cases-alert"
                        />
                      )}
                    </div>
                  </div>

                  {/* Constraints Section */}
                  <div className="space-y-4">
                    <h4 className="text-foreground/80 border-divider border-b pb-2 text-base font-semibold">
                      <FormattedMessage
                        {...messages.executionConstraintsTitle}
                      />
                    </h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Form.Field
                        form={form}
                        name={`problems.${index}.timeLimit`}
                      >
                        <NumberInput
                          label={
                            <FormattedMessage {...messages.timeLimitLabel} />
                          }
                          description={
                            <FormattedMessage
                              {...messages.timeLimitDescription}
                            />
                          }
                          step={500}
                          endContent={
                            <span className="text-foreground/60 text-sm">
                              ms
                            </span>
                          }
                        />
                      </Form.Field>
                      <Form.Field
                        form={form}
                        name={`problems.${index}.memoryLimit`}
                      >
                        <NumberInput
                          label={
                            <FormattedMessage {...messages.memoryLimitLabel} />
                          }
                          description={
                            <FormattedMessage
                              {...messages.memoryLimitDescription}
                            />
                          }
                          step={512}
                          endContent={
                            <span className="text-foreground/60 text-sm">
                              MB
                            </span>
                          }
                        />
                      </Form.Field>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}

          <Button
            className="self-center"
            color="primary"
            variant="bordered"
            startContent={<PlusIcon className="h-5 w-5" />}
            onPress={() =>
              append({ timeLimit: "1000", memoryLimit: "1024" } as any)
            }
            data-testid="add-problem"
          >
            <FormattedMessage {...messages.newLabel} />
          </Button>
        </div>
      ) : (
        /* Empty State */
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-testid="empty"
        >
          <h4 className="text-foreground/80 mb-2 text-lg font-semibold">
            <FormattedMessage {...messages.emptyStateTitle} />
          </h4>
          <p className="text-foreground/60 mb-6 max-w-md text-sm">
            <FormattedMessage {...messages.emptyStateDescription} />
          </p>
          <Button
            color="primary"
            startContent={<PlusIcon className="h-5 w-5" />}
            onPress={() =>
              append({ timeLimit: "1000", memoryLimit: "1024" } as any)
            }
            data-testid="add-first-problem"
          >
            <FormattedMessage {...messages.addFirstProblemLabel} />
          </Button>
        </div>
      )}
    </div>
  );
}
