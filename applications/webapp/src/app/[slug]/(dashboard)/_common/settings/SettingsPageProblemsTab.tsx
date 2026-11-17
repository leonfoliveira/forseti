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
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

type Props = {
  contest: ContestWithMembersAndProblemsResponseDTO;
  form: UseFormReturn<SettingsFormType>;
  isUpdateLoading?: boolean;
};

export function SettingsPageProblemsTab({
  contest,
  form,
  isUpdateLoading,
}: Props) {
  const errorHandler = useErrorHandler();
  const toast = useToast();
  const contestStatus = useContestStatusWatcher();

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
        default: () =>
          toast.error(
            "[slug].(dashboard)._common.settings.SettingsPageProblemsTab.downloadAttachmentFailed",
          ),
      });
    }
  }

  const hasContestEnded = contestStatus === ContestStatus.ENDED;

  return (
    <FieldSet disabled={isUpdateLoading || hasContestEnded}>
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
                  label="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.labelTitle"
                  field={<Input data-testid="problem-title" />}
                  description="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.descriptionTitle"
                />

                <ControlledField
                  form={form}
                  name={`problems.${index}.timeLimitMs`}
                  label="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.labelTimeLimit"
                  field={
                    <Input
                      type="number"
                      step="500"
                      data-testid="problem-time-limit"
                    />
                  }
                  description="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.descriptionTimeLimit"
                />

                <ControlledField
                  form={form}
                  name={`problems.${index}.memoryLimitMb`}
                  label="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.labelMemoryLimit"
                  field={
                    <Input
                      type="number"
                      step="512"
                      data-testid="problem-memory-limit"
                    />
                  }
                  description="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.descriptionMemoryLimit"
                />

                <div>
                  <ControlledField
                    form={form}
                    name={`problems.${index}.newDescription`}
                    label="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.labelDescription"
                    field={
                      <Input
                        type="file"
                        accept="application/pdf"
                        data-testid="problem-description"
                      />
                    }
                    description="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.descriptionDescription"
                  />

                  {field.description && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-2 w-full justify-start"
                      title={field.description.filename}
                      onClick={() => downloadAttachment(field.description!!)}
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
                    label="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.labelTestCases"
                    field={
                      <Input
                        type="file"
                        accept="text/csv"
                        data-testid="problem-test-cases"
                      />
                    }
                    description="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.descriptionTestCases"
                  />

                  {field.testCases && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-2 w-full justify-start"
                      title={field.testCases.filename}
                      onClick={() => downloadAttachment(field.testCases!!)}
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
                  <TooltipContent>
                    <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.tooltipMoveUp" />
                  </TooltipContent>
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
                  <TooltipContent>
                    <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.tooltipMoveDown" />
                  </TooltipContent>
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
                  <TooltipContent>
                    <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.tooltipRemove" />
                  </TooltipContent>
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
              timeLimitMs: "1000",
              memoryLimitMb: "1024",
            } as SettingsFormType["problems"][number])
          }
          data-testid="add-problem-button"
        >
          <PlusIcon />
          <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageProblemsTab.buttonNewProblem" />
        </Button>
      </div>
    </FieldSet>
  );
}
