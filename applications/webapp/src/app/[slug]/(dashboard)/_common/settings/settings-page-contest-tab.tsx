/* eslint-disable formatjs/enforce-default-message */

import { AlertCircleIcon, TriangleAlertIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Checkbox } from "@/app/_lib/component/shadcn/checkbox";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Switch } from "@/app/_lib/component/shadcn/switch";
import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { useDialog } from "@/app/_lib/hook/dialog-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { contestSlice } from "@/app/_store/slices/contest-slice";
import { adminDashboardSlice } from "@/app/_store/slices/dashboard/admin-dashboard-slice";
import { useAppDispatch } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import {
  languageGroups,
  SubmissionLanguage,
} from "@/core/domain/enumerate/SubmissionLanguage";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
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
  autoFreezeAtLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.auto-freeze-at-label",
    defaultMessage: "Auto Freeze At",
  },
  autoFreezeAtDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.auto-freeze-at-description",
    defaultMessage:
      "The time when the scoreboard will be automatically frozen.",
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
  isClarificationEnabledLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-clarification-enabled-label",
    defaultMessage: "Clarifications",
  },
  isClarificationEnabledDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-clarification-enabled-description",
    defaultMessage: "Whether to allow participants to ask clarifications.",
  },
  isSubmissionPrintTicketEnabledLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-submission-print-ticket-enabled-label",
    defaultMessage: "Submission Print Ticket",
  },
  isSubmissionPrintTicketEnabledDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-submission-print-ticket-enabled-description",
    defaultMessage: "Whether to enable print tickets for submissions.",
  },
  isTechnicalSupportTicketEnabledLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-technical-support-ticket-enabled-label",
    defaultMessage: "Technical Support Ticket",
  },
  isTechnicalSupportTicketEnabledDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-technical-support-ticket-enabled-description",
    defaultMessage: "Whether to enable technical support tickets.",
  },
  isNonTechnicalSupportTicketEnabledLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-non-technical-support-ticket-enabled-label",
    defaultMessage: "Non-Technical Support Ticket",
  },
  isNonTechnicalSupportTicketEnabledDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-non-technical-support-ticket-enabled-description",
    defaultMessage: "Whether to enable non-technical support tickets.",
  },
  isGuestEnabledLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-guest-enabled-label",
    defaultMessage: "Guest Access",
  },
  isGuestEnabledDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.is-guest-enabled-description",
    defaultMessage: "Whether to allow guest access to the contest.",
  },
  freezeLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.freeze-label",
    defaultMessage: "Freeze",
  },
  unfreezeLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.unfreeze-label",
    defaultMessage: "Unfreeze",
  },
  freezeSuccess: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.freeze-success",
    defaultMessage: "Leaderboard frozen successfully.",
  },
  unfreezeSuccess: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.unfreeze-success",
    defaultMessage: "Leaderboard unfrozen successfully.",
  },
  freezeError: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.freeze-error",
    defaultMessage: "Failed to freeze the leaderboard.",
  },
  unfreezeError: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.unfreeze-error",
    defaultMessage: "Failed to unfreeze the leaderboard.",
  },
  freezeConfirmationTitle: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.freeze-confirmation-title",
    defaultMessage: "Confirm Freeze",
  },
  freezeConfirmationDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.freeze-confirmation-description",
    defaultMessage:
      "Are you sure you want to freeze the leaderboard? This will prevent any further updates until it is unfrozen.",
  },
  unfreezeConfirmationTitle: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.unfreeze-confirmation-title",
    defaultMessage: "Confirm Unfreeze",
  },
  unfreezeConfirmationDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-contest-tab.unfreeze-confirmation-description",
    defaultMessage:
      "Are you sure you want to unfreeze the leaderboard? This will allow updates to be reflected again.",
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
  contest: ContestWithMembersAndProblemsDTO;
  leaderboard: LeaderboardResponseDTO;
  form: UseFormReturn<SettingsFormType>;
  onToggleFreeze: (contest: ContestWithMembersAndProblemsDTO) => void;
  isDisabled?: boolean;
};

export function SettingsPageContestTab({
  contest,
  leaderboard,
  form,
  onToggleFreeze,
  isDisabled,
}: Props) {
  const forceState = useLoadableState();
  const freezeToggleState = useLoadableState();
  const contestStatus = useContestStatusWatcher();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const freezeConfirmationDialog = useDialog();
  const forceConfirmationDialog = useDialog();

  const languageError = form.formState.errors.contest?.languages?.message;

  async function toggleFreeze() {
    const method = leaderboard.isFrozen
      ? Composition.leaderboardWritter.unfreeze.bind(
          Composition.leaderboardWritter,
        )
      : Composition.leaderboardWritter.freeze.bind(
          Composition.leaderboardWritter,
        );
    const successMessage = leaderboard.isFrozen
      ? messages.unfreezeSuccess
      : messages.freezeSuccess;
    const errorMessage = leaderboard.isFrozen
      ? messages.unfreezeError
      : messages.freezeError;

    console.debug("Toggling freeze. Current state:", leaderboard.isFrozen);
    freezeToggleState.start();

    try {
      const updatedContest = await method(contest.id);

      toast.success(successMessage);
      onToggleFreeze(updatedContest);
      freezeConfirmationDialog.close();
      freezeToggleState.finish();
      console.debug("Freeze toggled successfully");
    } catch (error) {
      await freezeToggleState.fail(error, {
        default: () => toast.error(errorMessage),
      });
    }
  }

  async function force(mode: "start" | "end") {
    const method =
      mode === "start"
        ? Composition.contestWritter.forceStart.bind(Composition.contestWritter)
        : Composition.contestWritter.forceEnd.bind(Composition.contestWritter);
    const successMessage =
      mode === "start" ? messages.forceStartSuccess : messages.forceEndSuccess;
    const errorMessage =
      mode === "start" ? messages.forceStartError : messages.forceEndError;

    console.debug(`Forcing contest ${mode}. Current status:`, contestStatus);
    forceState.start();

    try {
      const newContestMetadata = await method(contest.id);

      toast.success(successMessage);
      dispatch(
        adminDashboardSlice.actions.setContest({
          ...contest,
          ...newContestMetadata,
        }),
      );
      dispatch(contestSlice.actions.set(newContestMetadata));
      forceConfirmationDialog.close();
      forceState.finish();

      console.debug(`Contest force ${mode}ed successfully`);
    } catch (error) {
      await forceState.fail(error, {
        default: () => toast.error(errorMessage),
      });
    }
  }

  return (
    <>
      <FieldSet disabled={isDisabled}>
        <div className="flex flex-col gap-4" data-testid="settings-contest-tab">
          <div className="grid grid-cols-2 gap-6">
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
              field={
                <Input type="datetime-local" data-testid="contest-end-at" />
              }
              description={messages.endAtDescription}
            />

            <ControlledField
              form={form}
              name="contest.autoFreezeAt"
              label={messages.autoFreezeAtLabel}
              field={
                <Input
                  type="datetime-local"
                  data-testid="contest-auto-freeze-at"
                />
              }
              description={messages.autoFreezeAtDescription}
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

            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              <ControlledField
                form={form}
                name="contest.settings.isAutoJudgeEnabled"
                label={messages.isAutoJudgeEnabledLabel}
                field={<Switch data-testid="contest-is-auto-judge-enabled" />}
                description={messages.isAutoJudgeEnabledDescription}
              />
              <ControlledField
                form={form}
                name="contest.settings.isClarificationEnabled"
                label={messages.isClarificationEnabledLabel}
                field={
                  <Switch data-testid="contest-is-clarification-enabled" />
                }
                description={messages.isClarificationEnabledDescription}
              />
              <ControlledField
                form={form}
                name="contest.settings.isSubmissionPrintTicketEnabled"
                label={messages.isSubmissionPrintTicketEnabledLabel}
                field={
                  <Switch data-testid="contest-is-submission-print-ticket-enabled" />
                }
                description={messages.isSubmissionPrintTicketEnabledDescription}
              />
              <ControlledField
                form={form}
                name="contest.settings.isTechnicalSupportTicketEnabled"
                label={messages.isTechnicalSupportTicketEnabledLabel}
                field={
                  <Switch data-testid="contest-is-technical-support-ticket-enabled" />
                }
                description={
                  messages.isTechnicalSupportTicketEnabledDescription
                }
              />
              <ControlledField
                form={form}
                name="contest.settings.isNonTechnicalSupportTicketEnabled"
                label={messages.isNonTechnicalSupportTicketEnabledLabel}
                field={
                  <Switch data-testid="contest-is-non-technical-support-ticket-enabled" />
                }
                description={
                  messages.isNonTechnicalSupportTicketEnabledDescription
                }
              />
              <ControlledField
                form={form}
                name="contest.settings.isGuestEnabled"
                label={messages.isGuestEnabledLabel}
                field={<Switch data-testid="contest-is-guest-enabled" />}
                description={messages.isGuestEnabledDescription}
              />
            </div>
          </div>
        </div>
      </FieldSet>

      <Separator className="my-5" />

      <div
        className="flex flex-col gap-3"
        data-testid="contest-management-actions"
      >
        <Button
          type="button"
          variant="secondary"
          onClick={freezeConfirmationDialog.open}
          data-testid="freeze-toggle-button"
          disabled={isDisabled && !leaderboard.isFrozen}
        >
          <FormattedMessage
            {...(leaderboard.isFrozen
              ? messages.unfreezeLabel
              : messages.freezeLabel)}
          />
        </Button>

        <Button
          type="button"
          variant="secondary"
          data-testid="force-toggle-button"
          onClick={forceConfirmationDialog.open}
          disabled={isDisabled || forceState.isLoading}
        >
          <FormattedMessage
            {...(contestStatus === ContestStatus.NOT_STARTED
              ? messages.forceStartLabel
              : messages.forceEndLabel)}
          />
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={freezeConfirmationDialog.isOpen}
        icon={<AlertCircleIcon />}
        title={
          leaderboard.isFrozen
            ? messages.unfreezeConfirmationTitle
            : messages.freezeConfirmationTitle
        }
        description={
          leaderboard.isFrozen
            ? messages.unfreezeConfirmationDescription
            : messages.freezeConfirmationDescription
        }
        onCancel={freezeConfirmationDialog.close}
        onConfirm={toggleFreeze}
        isLoading={freezeToggleState.isLoading}
      />

      <ConfirmationDialog
        isOpen={forceConfirmationDialog.isOpen}
        icon={<TriangleAlertIcon />}
        title={
          contestStatus === ContestStatus.NOT_STARTED
            ? messages.forceStartConfirmationTitle
            : messages.forceEndConfirmationTitle
        }
        description={
          contestStatus === ContestStatus.NOT_STARTED
            ? messages.forceStartConfirmationDescription
            : messages.forceEndConfirmationDescription
        }
        onCancel={forceConfirmationDialog.close}
        onConfirm={() =>
          force(contestStatus === ContestStatus.NOT_STARTED ? "start" : "end")
        }
        isLoading={forceState.isLoading}
      />
    </>
  );
}
