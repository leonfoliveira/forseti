import { UseFormReturn } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { Alert } from "@/app/_lib/component/base/feedback/alert";
import { Button } from "@/app/_lib/component/base/form/button";
import { Checkbox } from "@/app/_lib/component/base/form/checkbox";
import { DatePicker } from "@/app/_lib/component/base/form/date-picker";
import { Form } from "@/app/_lib/component/base/form/form";
import { Input } from "@/app/_lib/component/base/form/input";
import { Switch } from "@/app/_lib/component/base/form/switch";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { ConfirmationModal } from "@/app/_lib/component/modal/confirmation-modal";
import { cls } from "@/app/_lib/util/cls";
import { useContestStatusWatcher } from "@/app/_lib/util/contest-status-watcher";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useModal } from "@/app/_lib/util/modal-hook";
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
  basicInformationSection: {
    id: "app.[slug].(dashboard).settings._tab.contest.basic-information-section",
    defaultMessage: "Basic Information",
  },
  slugLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.slug-label",
    defaultMessage: "Slug",
  },
  slugDescription: {
    id: "app.[slug].(dashboard).settings._tab.contest.slug-description",
    defaultMessage: "Unique identifier for the contest URL",
  },
  titleLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.title-label",
    defaultMessage: "Title",
  },
  titleDescription: {
    id: "app.[slug].(dashboard).settings._tab.contest.title-description",
    defaultMessage: "Display name for the contest",
  },
  contestConfigurationSection: {
    id: "app.[slug].(dashboard).settings._tab.contest.contest-configuration-section",
    defaultMessage: "Configuration",
  },
  languagesLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.languages-label",
    defaultMessage: "Languages",
  },
  languageDescription: {
    id: "app.[slug].(dashboard).settings._tab.contest.languages-description",
    defaultMessage:
      "Make sure the sandboxes for the selected languages are installed",
  },
  startLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.start-label",
    defaultMessage: "Start",
  },
  startDescription: {
    id: "app.[slug].(dashboard).settings._tab.contest.start-description",
    defaultMessage: "Start time of the contest",
  },
  endLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.end-label",
    defaultMessage: "End",
  },
  endDescription: {
    id: "app.[slug].(dashboard).settings._tab.contest.end-description",
    defaultMessage: "End time of the contest",
  },
  isAutoJudgeEnabledLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.is-auto-judge-enabled-label",
    defaultMessage: "Enable Auto Judge",
  },
  forceStartLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-start-label",
    defaultMessage: "Force Start Now",
  },
  forceEndLabel: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-end-label",
    defaultMessage: "Force End Now",
  },
  controlSection: {
    id: "app.[slug].(dashboard).settings._tab.contest.control-section",
    defaultMessage: "Control",
  },
  controlTimeSection: {
    id: "app.[slug].(dashboard).settings._tab.contest.control-time-section",
    defaultMessage:
      "Use these actions to override the scheduled contest timing",
  },
  currentStatus: {
    id: "app.[slug].(dashboard).settings._tab.contest.current-status",
    defaultMessage: "Current Status: {status}",
  },
  forceStartBody: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-start-body",
    defaultMessage: "Are you sure you want to force start the contest?",
  },
  forceStartAlertTitle: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-start-alert-title",
    defaultMessage: "Attention",
  },
  forceStartAlertBody: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-start-alert-body",
    defaultMessage:
      "The contest will start accepting submissions and this action cannot be undone. However, you will still be able to edit the contest settings afterwards.",
  },
  forceEndBody: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-end-body",
    defaultMessage: "Are you sure you want to force end the contest?",
  },
  forceEndAlertTitle: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-end-alert-title",
    defaultMessage: "Attention",
  },
  forceEndAlertBody: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-end-alert-body",
    defaultMessage:
      "The contest will stop accepting submissions and this action cannot be undone. You will not be able to edit the contest settings afterwards.",
  },
  forceStartSuccess: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-start-success",
    defaultMessage: "Contest has started.",
  },
  forceStartError: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-start-error",
    defaultMessage: "Failed to start contest.",
  },
  forceEndSuccess: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-end-success",
    defaultMessage: "Contest has ended.",
  },
  forceEndError: {
    id: "app.[slug].(dashboard).settings._tab.contest.force-end-error",
    defaultMessage: "Failed to end contest.",
  },
});

type Props = {
  contest: ContestFullResponseDTO;
  form: UseFormReturn<SettingsForm>;
  isOpen: boolean;
};

/**
 * Displays the contest settings tab within the admin dashboard.
 * Allows administrators to configure contest details, languages, and control contest timing.
 */
export function ContestSettings({ contest, form, isOpen }: Props) {
  const contestStatus = useContestStatusWatcher();
  const forceStartState = useLoadableState();
  const forceEndState = useLoadableState();
  const forceStartModal = useModal();
  const forceEndModal = useModal();
  const toast = useToast();
  const dispatch = useAppDispatch();

  async function forceStart() {
    forceStartState.start();
    try {
      const newContestMetadata = await contestWritter.forceStart(contest.id);
      dispatch(
        adminDashboardSlice.actions.setContest({
          ...contest,
          ...newContestMetadata,
        }),
      );
      dispatch(contestMetadataSlice.actions.set(newContestMetadata));
      toast.success(messages.forceStartSuccess);
      forceStartModal.close();
    } catch (error) {
      forceStartState.fail(error, {
        default: () => toast.error(messages.forceStartError),
      });
    }
  }

  async function forceEnd() {
    forceEndState.start();
    try {
      const newContestMetadata = await contestWritter.forceEnd(contest.id);
      dispatch(
        adminDashboardSlice.actions.setContest({
          ...contest,
          ...newContestMetadata,
        }),
      );
      dispatch(contestMetadataSlice.actions.set(newContestMetadata));
      toast.success(messages.forceEndSuccess);
      forceEndModal.close();
    } catch (error) {
      forceEndState.fail(error, {
        default: () => toast.error(messages.forceEndError),
      });
    }
  }

  return (
    <div
      className={cls("flex flex-col gap-8 p-6", !isOpen && "hidden")}
      data-testid="contest-settings"
    >
      {/* Basic Information Section */}
      <div className="space-y-6">
        <h3 className="text-foreground/90 border-divider border-b pb-2 text-lg font-semibold">
          <FormattedMessage {...messages.basicInformationSection} />
        </h3>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Form.Field form={form} name="slug">
            <Input
              label={<FormattedMessage {...messages.slugLabel} />}
              className="col-span-1"
              description={<FormattedMessage {...messages.slugDescription} />}
            />
          </Form.Field>
          <Form.Field form={form} name="title">
            <Input
              label={<FormattedMessage {...messages.titleLabel} />}
              className="col-span-1 lg:col-span-2"
              description={<FormattedMessage {...messages.titleDescription} />}
            />
          </Form.Field>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Form.Field form={form} name="startAt">
            <DatePicker
              label={<FormattedMessage {...messages.startLabel} />}
              granularity="minute"
              description={<FormattedMessage {...messages.startDescription} />}
              isDisabled={contestStatus !== ContestStatus.NOT_STARTED}
              data-testid="start-at-picker"
            />
          </Form.Field>
          <Form.Field form={form} name="endAt">
            <DatePicker
              label={<FormattedMessage {...messages.endLabel} />}
              granularity="minute"
              description={<FormattedMessage {...messages.endDescription} />}
              data-testid="end-at-picker"
            />
          </Form.Field>
        </div>
      </div>

      {/* Contest Configuration Section */}
      <div className="space-y-6">
        <h3 className="text-foreground/90 border-divider border-b pb-2 text-lg font-semibold">
          <FormattedMessage {...messages.contestConfigurationSection} />
        </h3>

        <div className="space-y-6">
          <Form.Field form={form} name="languages">
            <Checkbox.Group
              orientation="horizontal"
              label={<FormattedMessage {...messages.languagesLabel} />}
              classNames={{
                wrapper: "bg-content2/50 rounded-sm p-4",
              }}
              description={
                <FormattedMessage {...messages.languageDescription} />
              }
            >
              {Object.keys(SubmissionLanguage).map((it) => (
                <Checkbox
                  key={it}
                  value={it}
                  label={
                    <FormattedMessage
                      {...globalMessages.language[it as SubmissionLanguage]}
                    />
                  }
                />
              ))}
            </Checkbox.Group>
          </Form.Field>

          <Form.Field form={form} name="settings.isAutoJudgeEnabled">
            <Switch
              label={<FormattedMessage {...messages.isAutoJudgeEnabledLabel} />}
              data-testid="is-auto-judge-enabled"
            />
          </Form.Field>
        </div>
      </div>

      {/* Contest Control Section */}
      <div className="space-y-6">
        <Divider />
        <div className="space-y-4">
          <h3 className="text-foreground/90 text-lg font-semibold">
            <FormattedMessage {...messages.controlSection} />
          </h3>
          <p className="text-foreground/60 text-sm">
            <FormattedMessage {...messages.controlTimeSection} />
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Button
              color="warning"
              size="md"
              isDisabled={contestStatus !== ContestStatus.NOT_STARTED}
              onPress={forceStartModal.open}
              data-testid="force-start"
            >
              <FormattedMessage {...messages.forceStartLabel} />
            </Button>
            <Button
              color="danger"
              size="md"
              isDisabled={contestStatus !== ContestStatus.IN_PROGRESS}
              onPress={forceEndModal.open}
              data-testid="force-end"
            >
              <FormattedMessage {...messages.forceEndLabel} />
            </Button>
          </div>
        </div>
      </div>

      {/* Force start confirmation modal */}
      <ConfirmationModal
        isOpen={forceStartModal.isOpen}
        isLoading={forceStartState.isLoading}
        onClose={forceStartModal.close}
        title={<FormattedMessage {...messages.forceStartLabel} />}
        body={
          <>
            <Alert
              color="danger"
              title={<FormattedMessage {...messages.forceStartAlertTitle} />}
              description={
                <FormattedMessage {...messages.forceStartAlertBody} />
              }
            />
            <FormattedMessage {...messages.forceStartBody} />
          </>
        }
        onConfirm={forceStart}
        data-testid="confirm-force-start-modal"
      />

      {/* Force end confirmation modal */}
      <ConfirmationModal
        isOpen={forceEndModal.isOpen}
        isLoading={forceEndState.isLoading}
        onClose={forceEndModal.close}
        title={<FormattedMessage {...messages.forceEndLabel} />}
        body={
          <>
            <Alert
              color="danger"
              title={<FormattedMessage {...messages.forceEndAlertTitle} />}
              description={<FormattedMessage {...messages.forceEndAlertBody} />}
            />
            <FormattedMessage {...messages.forceEndBody} />
          </>
        }
        onConfirm={forceEnd}
        data-testid="confirm-force-end-modal"
      />
    </div>
  );
}
