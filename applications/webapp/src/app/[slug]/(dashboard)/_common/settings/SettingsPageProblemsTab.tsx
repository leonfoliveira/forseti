import {
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { ColorPicker } from "@/app/_lib/component/form/ColorPicker";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { Button } from "@/app/_lib/component/shadcn/button";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@/app/_lib/component/shadcn/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_lib/component/shadcn/tooltip";
import { useErrorHandler } from "@/app/_lib/hook/useErrorHandler";
import { useToast } from "@/app/_lib/hook/useToast";
import { ColorUtil } from "@/app/_lib/util/ColorUtil";
import { Composition } from "@/config/composition";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { ContestWithMembersAndProblemsDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

type Props = {
  contest: ContestWithMembersAndProblemsDTO;
  form: UseFormReturn<SettingsFormType>;
  isDisabled?: boolean;
};

export function SettingsPageProblemsTab({ contest, form, isDisabled }: Props) {
  const errorHandler = useErrorHandler();
  const toast = useToast();

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "problems",
  });

  async function downloadAttachment(attachment: AttachmentResponseDTO) {
    console.debug("Starting to download attachment:", attachment.filename);

    try {
      await Composition.attachmentReader.download(contest.id, attachment);

      console.debug("Attachment downloaded successfully:", attachment.filename);
    } catch (error) {
      await errorHandler.handle(error as Error, {
        default: () => toast.error("Failed to download attachment."),
      });
    }
  }

  return (
    <FieldSet disabled={isDisabled}>
      <div className="flex flex-col gap-4" data-testid="settings-problems-tab">
        {fields.map((field, index) => (
          <Item key={field.id} variant="outline" data-testid="problem-item">
            <ItemMedia className="flex flex-col">
              <Badge
                className="font-md text-lg"
                style={{
                  backgroundColor: form.watch(`problems.${index}.color`),
                }}
                data-testid="problem-letter"
              >
                <span
                  style={{
                    color: ColorUtil.getForegroundColor(
                      form.watch(`problems.${index}.color`),
                    ),
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
              </Badge>
              <ControlledField
                form={form}
                name={`problems.${index}.color`}
                field={<ColorPicker data-testid="problem-color" />}
              />
            </ItemMedia>
            <ItemContent>
              <div className="grid grid-cols-2 gap-3">
                <ControlledField
                  className="col-span-2"
                  form={form}
                  name={`problems.${index}.title`}
                  label="Title"
                  field={<Input data-testid="problem-title" />}
                  description="The title of the problem."
                />

                <ControlledField
                  form={form}
                  name={`problems.${index}.timeLimit`}
                  label="Time Limit"
                  field={
                    <Input
                      type="number"
                      step="500"
                      data-testid="problem-time-limit"
                    />
                  }
                  description="The time limit for the problem in milliseconds."
                />

                <ControlledField
                  form={form}
                  name={`problems.${index}.memoryLimit`}
                  label="Memory Limit"
                  field={
                    <Input
                      type="number"
                      step="500"
                      data-testid="problem-memory-limit"
                    />
                  }
                  description="The memory limit for the problem in megabytes."
                />

                <div>
                  <ControlledField
                    form={form}
                    name={`problems.${index}.newDescription`}
                    label="Description"
                    field={
                      <Input
                        type="file"
                        accept="application/pdf"
                        data-testid="problem-description"
                      />
                    }
                    description="The PDF file containing the problem description."
                  />

                  {field.description && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-2 w-full justify-start"
                      title={field.description.filename}
                      onClick={() => downloadAttachment(field.description)}
                      data-testid="problem-description-download"
                    >
                      <DownloadIcon />
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
                    label="Test Cases"
                    field={
                      <Input
                        type="file"
                        accept="text/csv"
                        data-testid="problem-test-cases"
                      />
                    }
                    description="The CSV file containing the test cases for the problem."
                  />

                  {field.testCases && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-2 w-full justify-start"
                      title={field.testCases.filename}
                      onClick={() => downloadAttachment(field.testCases)}
                      data-testid="problem-test-cases-download"
                    >
                      <DownloadIcon />
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      data-testid="move-problem-up-button"
                    >
                      <ChevronUpIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move Up</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      data-testid="move-problem-down-button"
                    >
                      <ChevronDownIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move Down</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      className="mt-5"
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(index)}
                      data-testid="remove-problem-button"
                    >
                      <TrashIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove</TooltipContent>
                </Tooltip>
              </div>
            </ItemActions>
          </Item>
        ))}
        <Button
          type="button"
          onClick={() =>
            append({
              title: "",
              color: ColorUtil.getRandom(),
              timeLimit: "1000",
              memoryLimit: "1024",
            } as SettingsFormType["problems"][number])
          }
          data-testid="add-problem-button"
        >
          <PlusIcon />
          New Problem
        </Button>
      </div>
    </FieldSet>
  );
}
