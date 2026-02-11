/* eslint-disable formatjs/enforce-default-message */

import { TriangleAlert } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from "@/app/_lib/component/feedback/confirmation-dialog";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { CardContent } from "@/app/_lib/component/shadcn/card";
import { Checkbox } from "@/app/_lib/component/shadcn/checkbox";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Switch } from "@/app/_lib/component/shadcn/switch";
import { useContestStatusWatcher } from "@/app/_lib/util/contest-status-watcher";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useToast } from "@/app/_lib/util/toast-hook";
import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { contestMetadataSlice } from "@/app/_store/slices/contest-metadata-slice";
import { useAppDispatch } from "@/app/_store/store";
import { contestWritter } from "@/config/composition";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  slugLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.slug-label",
    defaultMessage: "Slug",
  },
  slugDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.slug-description",
    defaultMessage: "The slug is used in the URL and must be unique.",
  },
  titleLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.title-label",
    defaultMessage: "Title",
  },
  titleDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.title-description",
    defaultMessage: "The title of the contest.",
  },
  startAtLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.start-at-label",
    defaultMessage: "Start At",
  },
  startAtDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.start-at-description",
    defaultMessage: "The start time of the contest.",
  },
  endAtLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.end-at-label",
    defaultMessage: "End At",
  },
  endAtDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.end-at-description",
    defaultMessage: "The end time of the contest.",
  },
  languagesLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.languages-label",
    defaultMessage: "Languages",
  },
  languagesDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.languages-description",
    defaultMessage: "The programming languages allowed in the contest.",
  },
  isAutoJudgeEnabledLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-auto-judge-enabled-label",
    defaultMessage: "Auto Judge",
  },
  isAutoJudgeEnabledDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-auto-judge-enabled-description",
    defaultMessage: "Whether to enable auto judging of submissions.",
  },
  forceStartLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-start-label",
    defaultMessage: "Force Start",
  },
  forceStartConfirmationTitle: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-start-confirmation-title",
    defaultMessage:
      "Are you sure you want to force the contest to start immediately?",
  },
  forceStartConfirmationDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-start-confirmation-description",
    defaultMessage: "This action cannot be undone.",
  },
  forceStartSuccess: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-start-success",
    defaultMessage: "Contest has been force started.",
  },
  forceStartError: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-start-error",
    defaultMessage: "Failed to force start the contest.",
  },
  forceEndLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-end-label",
    defaultMessage: "Force End",
  },
  forceEndConfirmationTitle: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-end-confirmation-title",
    defaultMessage:
      "Are you sure you want to force the contest to end immediately?",
  },
  forceEndConfirmationDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-end-confirmation-description",
    defaultMessage: "This action cannot be undone.",
  },
  forceEndSuccess: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-end-success",
    defaultMessage: "Contest has been force ended.",
  },
  forceEndError: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.force-end-error",
    defaultMessage: "Failed to force end the contest.",
  },
});

type Props = {
  contest: ContestFullResponseDTO;
  form: UseFormReturn<SettingsFormType>;
};

export function SettingsPageContestTab({ contest, form }: Props) {
  const forceState = useLoadableState();
  const contestStatus = useContestStatusWatcher();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const forceStartConfirmationDialog = useConfirmationDialog();
  const forceEndConfirmationDialog = useConfirmationDialog();

  const languageError = form.formState.errors.contest?.languages?.message;
  const languageGroups = ["CPP", "JAVA", "PYTHON"];

  async function force(mode: "start" | "end") {
    const method =
      mode === "start"
        ? contestWritter.forceStart.bind(contestWritter)
        : contestWritter.forceEnd.bind(contestWritter);
    const successMessage =
      mode === "start" ? messages.forceStartSuccess : messages.forceEndSuccess;
    const errorMessage =
      mode === "start" ? messages.forceStartError : messages.forceEndError;

    forceState.start();
    try {
      const newContestMetadata = await method(contest.id);
      dispatch(
        adminDashboardSlice.actions.setContest({
          ...contest,
          ...newContestMetadata,
        }),
      );
      dispatch(contestMetadataSlice.actions.set(newContestMetadata));
      forceState.finish();
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      forceState.fail(error, {
        default: () => toast.error(errorMessage),
      });
    }
  }

  return (
    <CardContent
      className="flex flex-col gap-4"
      data-testid="settings-contest-tab"
    >
      <div className="grid grid-cols-2 gap-4">
        <ControlledField
          form={form}
          name="contest.slug"
          label={messages.slugLabel}
          field={<Input data-testid="contest-slug" />}
          description={messages.slugDescription}
        />

        <ControlledField
          form={form}
          name="contest.title"
          label={messages.titleLabel}
          field={<Input data-testid="contest-title" />}
          description={messages.titleDescription}
        />

        <ControlledField
          form={form}
          name="contest.startAt"
          label={messages.startAtLabel}
          field={
            <Input
              type="datetime-local"
              disabled={contestStatus !== ContestStatus.NOT_STARTED}
              data-testid="contest-start-at"
            />
          }
          description={messages.startAtDescription}
        />

        <ControlledField
          form={form}
          name="contest.endAt"
          label={messages.endAtLabel}
          field={<Input type="datetime-local" data-testid="contest-end-at" />}
          description={messages.endAtDescription}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <FieldLabel>
            <FormattedMessage {...messages.languagesLabel} />
          </FieldLabel>
          <FieldDescription>
            <FormattedMessage {...messages.languagesDescription} />
          </FieldDescription>
          {languageError && (
            <FieldError>
              <FormattedMessage id={languageError} defaultMessage="" />
            </FieldError>
          )}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {languageGroups.map((group) => (
            <div key={group}>
              {Object.keys(SubmissionLanguage)
                .filter((lang) => lang.startsWith(group))
                .map((lang) => (
                  <ControlledField
                    key={lang}
                    form={form}
                    name={`contest.languages.${lang}` as any}
                    label={
                      globalMessages.submissionLanguage[
                        lang as SubmissionLanguage
                      ]
                    }
                    field={
                      <Checkbox
                        value={lang}
                        data-testid={`contest-language-${lang}`}
                      />
                    }
                  />
                ))}
            </div>
          ))}
        </div>

        <Separator className="mt-3" />

        <div className="mt-3">
          <ControlledField
            className="col-span-2"
            form={form}
            name="contest.settings.isAutoJudgeEnabled"
            label={messages.isAutoJudgeEnabledLabel}
            field={<Switch data-testid="contest-is-auto-judge-enabled" />}
            description={messages.isAutoJudgeEnabledDescription}
          />
        </div>

        {contestStatus !== ContestStatus.ENDED && (
          <Separator className="my-3" />
        )}

        {contestStatus === ContestStatus.NOT_STARTED && (
          <>
            <Button
              type="button"
              variant="secondary"
              data-testid="contest-force-start"
              onClick={forceStartConfirmationDialog.open}
            >
              <FormattedMessage {...messages.forceStartLabel} />
            </Button>
            <ConfirmationDialog
              isOpen={forceStartConfirmationDialog.isOpen}
              icon={<TriangleAlert />}
              title={messages.forceStartConfirmationTitle}
              description={messages.forceStartConfirmationDescription}
              onCancel={forceStartConfirmationDialog.close}
              onConfirm={() => force("start")}
              isLoading={forceState.isLoading}
            />
          </>
        )}

        {contestStatus === ContestStatus.IN_PROGRESS && (
          <>
            <Button
              type="button"
              variant="secondary"
              data-testid="contest-force-end"
              onClick={forceEndConfirmationDialog.open}
            >
              <FormattedMessage {...messages.forceEndLabel} />
            </Button>
            <ConfirmationDialog
              isOpen={forceEndConfirmationDialog.isOpen}
              icon={<TriangleAlert />}
              title={messages.forceEndConfirmationTitle}
              description={messages.forceEndConfirmationDescription}
              onCancel={forceEndConfirmationDialog.close}
              onConfirm={() => force("end")}
              isLoading={forceState.isLoading}
            />
          </>
        )}
      </div>
    </CardContent>
  );
}
