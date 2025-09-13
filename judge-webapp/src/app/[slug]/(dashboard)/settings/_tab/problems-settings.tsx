import { PaperClipIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { attachmentService } from "@/config/composition";
import { defineMessages } from "@/i18n/message";
import { FileInput } from "@/lib/component/form/file-input";
import { FormField } from "@/lib/component/form/form-field";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  NumberInput,
} from "@/lib/heroui-wrapper";
import { cls } from "@/lib/util/cls";
import { useAppSelector } from "@/store/store";

const messages = defineMessages({
  problemsSectionTitle: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.section-title",
    defaultMessage: "Contest Problems",
  },
  problemsSectionSubtitle: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.section-subtitle",
    defaultMessage:
      "Configure the problems for this contest. Each problem requires a title, description, and test cases.",
  },
  titleLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.title-label",
    defaultMessage: "Title",
  },
  titleDescription: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.title-description",
    defaultMessage: "A clear, descriptive name for the problem",
  },
  descriptionLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.description-label",
    defaultMessage: "Description",
  },
  descriptionFileDescription: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.description-file-description",
    defaultMessage: "Upload a PDF or text file with the problem statement",
  },
  timeLimitLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.time-limit-label",
    defaultMessage: "Time Limit",
  },
  timeLimitDescription: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.time-limit-description",
    defaultMessage: "Maximum execution time per test case",
  },
  memoryLimitLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.memory-limit-label",
    defaultMessage: "Memory Limit",
  },
  memoryLimitDescription: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.memory-limit-description",
    defaultMessage: "Maximum memory usage per test case",
  },
  testCasesLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.test-cases-label",
    defaultMessage: "Test Cases",
  },
  testCasesDescription: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.test-cases-description",
    defaultMessage: "Upload a CSV file with input/output test cases",
  },
  currentFileLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.current-file-label",
    defaultMessage: "Current: {filename}",
  },
  newLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.new-label",
    defaultMessage: "New Problem",
  },
  problemHeaderSubtitle: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.problem-header-subtitle",
    defaultMessage: "Configure problem details and constraints",
  },
  executionConstraintsTitle: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.execution-constraints-title",
    defaultMessage: "Execution Constraints",
  },
  emptyStateTitle: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.empty-state-title",
    defaultMessage: "No Problems Added Yet",
  },
  emptyStateDescription: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.empty-state-description",
    defaultMessage:
      "Start by adding your first problem. Each problem should include a clear title, description, test cases, and execution constraints.",
  },
  addFirstProblemLabel: {
    id: "app.[slug].(dashboard).settings._tabs.problems-settings.add-first-problem-label",
    defaultMessage: "Add First Problem",
  },
});

type Props = {
  form: UseFormReturn<SettingsForm>;
  isOpen: boolean;
};

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
        <h3 className="text-lg font-semibold text-foreground/90">
          <FormattedMessage {...messages.problemsSectionTitle} />
        </h3>
        <p className="text-sm text-foreground/60 mt-1">
          <FormattedMessage {...messages.problemsSectionSubtitle} />
        </p>
      </div>

      {/* Problems List */}
      {fields.length > 0 ? (
        <div className="flex flex-col gap-8">
          {fields.map((problem, index) => (
            <Card key={problem.id} data-testid="problem">
              {/* Problem Header */}
              <CardHeader>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Chip
                      color="primary"
                      variant="flat"
                      className="font-semibold text-lg px-4 py-2"
                      data-testid="problem-index"
                    >
                      {String.fromCharCode(65 + index)}
                    </Chip>
                    <div className="h-6 w-px bg-divider" />
                    <span className="text-sm text-foreground/60">
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
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Problem Configuration */}
              <CardBody>
                <div className="grid grid-cols-1 gap-6">
                  {/* Title */}
                  <FormField form={form} name={`problems.${index}.title`}>
                    <Input
                      label={<FormattedMessage {...messages.titleLabel} />}
                      description={
                        <FormattedMessage {...messages.titleDescription} />
                      }
                    />
                  </FormField>

                  {/* File Uploads Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <FormField
                        form={form}
                        name={`problems.${index}.newDescription`}
                        isFile
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
                      </FormField>
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
                                      attachmentService.download(
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
                      <FormField
                        form={form}
                        name={`problems.${index}.newTestCases`}
                        isFile
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
                      </FormField>
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
                                      attachmentService.download(
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
                    <h4 className="text-base font-semibold text-foreground/80 border-b border-divider pb-2">
                      <FormattedMessage
                        {...messages.executionConstraintsTitle}
                      />
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
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
                            <span className="text-sm text-foreground/60">
                              ms
                            </span>
                          }
                        />
                      </FormField>
                      <FormField
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
                            <span className="text-sm text-foreground/60">
                              MB
                            </span>
                          }
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          <Button
            className="self-center"
            color="primary"
            variant="bordered"
            startContent={<PlusIcon className="w-5 h-5" />}
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
          <h4 className="text-lg font-semibold text-foreground/80 mb-2">
            <FormattedMessage {...messages.emptyStateTitle} />
          </h4>
          <p className="text-sm text-foreground/60 mb-6 max-w-md">
            <FormattedMessage {...messages.emptyStateDescription} />
          </p>
          <Button
            color="primary"
            startContent={<PlusIcon className="w-5 h-5" />}
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
