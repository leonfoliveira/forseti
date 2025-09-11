import { UseFormReturn } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { contestService } from "@/config/composition";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";
import { FormField } from "@/lib/component/form/form-field";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { ConfirmationModal } from "@/lib/component/modal/confirmation-modal";
import { Alert } from "@/lib/heroui-wrapper";
import { Button } from "@/lib/heroui-wrapper";
import { Divider } from "@/lib/heroui-wrapper";
import { DatePicker } from "@/lib/heroui-wrapper";
import { CheckboxGroup } from "@/lib/heroui-wrapper";
import { Checkbox } from "@/lib/heroui-wrapper";
import { Input } from "@/lib/heroui-wrapper";
import { useContestStatusWatcher } from "@/lib/util/contest-status-watcher";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useModal } from "@/lib/util/modal-hook";
import { useToast } from "@/lib/util/toast-hook";
import { adminDashboardSlice } from "@/store/slices/admin-dashboard-slice";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";
import { useAppDispatch } from "@/store/store";
import { cls } from "@/lib/util/cls";

const messages = defineMessages({
  basicInformationSection: {
    id: "app.[slug].(dashboard).settings.contest.basic-information-section",
    defaultMessage: "Basic Information",
  },
  slugLabel: {
    id: "app.[slug].(dashboard).settings.contest.slug-label",
    defaultMessage: "Slug",
  },
  slugDescription: {
    id: "app.[slug].(dashboard).settings.contest.slug-description",
    defaultMessage: "Unique identifier for the contest URL",
  },
  titleLabel: {
    id: "app.[slug].(dashboard).settings.contest.title-label",
    defaultMessage: "Title",
  },
  titleDescription: {
    id: "app.[slug].(dashboard).settings.contest.title-description",
    defaultMessage: "Display name for the contest",
  },
  contestConfigurationSection: {
    id: "app.[slug].(dashboard).settings.contest.contest-configuration-section",
    defaultMessage: "Contest Configuration",
  },
  languagesLabel: {
    id: "app.[slug].(dashboard).settings.contest.languages-label",
    defaultMessage: "Languages",
  },
  startLabel: {
    id: "app.[slug].(dashboard).settings.contest.start-label",
    defaultMessage: "Start",
  },
  startDescription: {
    id: "app.[slug].(dashboard).settings.contest.start-description",
    defaultMessage: "Start time of the contest",
  },
  endLabel: {
    id: "app.[slug].(dashboard).settings.contest.end-label",
    defaultMessage: "End",
  },
  endDescription: {
    id: "app.[slug].(dashboard).settings.contest.end-description",
    defaultMessage: "End time of the contest",
  },
  forceStartLabel: {
    id: "app.[slug].(dashboard).settings.contest.force-start-label",
    defaultMessage: "Force Start Now",
  },
  forceEndLabel: {
    id: "app.[slug].(dashboard).settings.contest.force-end-label",
    defaultMessage: "Force End Now",
  },
  controlSection: {
    id: "app.[slug].(dashboard).settings.contest.control-section",
    defaultMessage: "Contest Control",
  },
  controlTimeSection: {
    id: "app.[slug].(dashboard).settings.contest.control-time-section",
    defaultMessage:
      "Use these actions to override the scheduled contest timing",
  },
  currentStatus: {
    id: "app.[slug].(dashboard).settings.contest.current-status",
    defaultMessage: "Current Status: {status}",
  },
  forceStartBody: {
    id: "app.[slug].(dashboard).settings.contest.force-start-body",
    defaultMessage: "Are you sure you want to force start the contest?",
  },
  forceStartAlertTitle: {
    id: "app.[slug].(dashboard).settings.contest.force-start-alert-title",
    defaultMessage: "Attention",
  },
  forceStartAlertBody: {
    id: "app.[slug].(dashboard).settings.contest.force-start-alert-body",
    defaultMessage:
      "The contest will start accepting submissions and this action cannot be undone. However, you will still be able to edit the contest settings afterwards.",
  },
  forceEndBody: {
    id: "app.[slug].(dashboard).settings.contest.force-end-body",
    defaultMessage: "Are you sure you want to force end the contest?",
  },
  forceEndAlertTitle: {
    id: "app.[slug].(dashboard).settings.contest.force-end-alert-title",
    defaultMessage: "Attention",
  },
  forceEndAlertBody: {
    id: "app.[slug].(dashboard).settings.contest.force-end-alert-body",
    defaultMessage:
      "The contest will stop accepting submissions and this action cannot be undone. You will not be able to edit the contest settings afterwards.",
  },
  forceStartSuccess: {
    id: "app.[slug].(dashboard).settings.contest.force-start-success",
    defaultMessage: "Contest has started.",
  },
  forceStartError: {
    id: "app.[slug].(dashboard).settings.contest.force-start-error",
    defaultMessage: "Failed to start contest.",
  },
  forceEndSuccess: {
    id: "app.[slug].(dashboard).settings.contest.force-end-success",
    defaultMessage: "Contest has ended.",
  },
  forceEndError: {
    id: "app.[slug].(dashboard).settings.contest.force-end-error",
    defaultMessage: "Failed to end contest.",
  },
});

type Props = {
  contest: ContestFullResponseDTO;
  form: UseFormReturn<SettingsForm>;
  isOpen: boolean;
};

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
      const newContestMetadata = await contestService.forceStart(contest.id);
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
      const newContestMetadata = await contestService.forceEnd(contest.id);
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
        <h3 className="text-lg font-semibold text-foreground/90 border-b border-divider pb-2">
          <FormattedMessage {...messages.basicInformationSection} />
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormField form={form} name="slug">
            <Input
              label={<FormattedMessage {...messages.slugLabel} />}
              className="col-span-1"
              description={<FormattedMessage {...messages.slugDescription} />}
            />
          </FormField>
          <FormField form={form} name="title">
            <Input
              label={<FormattedMessage {...messages.titleLabel} />}
              className="col-span-1 lg:col-span-2"
              description={<FormattedMessage {...messages.titleDescription} />}
            />
          </FormField>
        </div>
      </div>

      {/* Contest Configuration Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground/90 border-b border-divider pb-2">
          <FormattedMessage {...messages.contestConfigurationSection} />
        </h3>

        <div className="space-y-6">
          <FormField form={form} name="languages">
            <CheckboxGroup
              orientation="horizontal"
              label={<FormattedMessage {...messages.languagesLabel} />}
              classNames={{
                wrapper: "bg-content2/50 rounded-sm p-4",
              }}
            >
              {Object.keys(Language).map((it) => (
                <Checkbox key={it} value={it}>
                  <span className="text-sm font-medium">
                    <FormattedMessage
                      {...globalMessages.language[it as Language]}
                    />
                  </span>
                </Checkbox>
              ))}
            </CheckboxGroup>
          </FormField>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <FormField form={form} name="startAt">
              <DatePicker
                label={<FormattedMessage {...messages.startLabel} />}
                granularity="minute"
                description={
                  <FormattedMessage {...messages.startDescription} />
                }
                isDisabled={contestStatus !== ContestStatus.NOT_STARTED}
                data-testid="start-at-picker"
              />
            </FormField>
            <FormField form={form} name="endAt">
              <DatePicker
                label={<FormattedMessage {...messages.endLabel} />}
                granularity="minute"
                description={<FormattedMessage {...messages.endDescription} />}
                data-testid="end-at-picker"
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Contest Control Section */}
      <div className="space-y-6">
        <Divider />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/90">
            <FormattedMessage {...messages.controlSection} />
          </h3>
          <p className="text-sm text-foreground/60">
            <FormattedMessage {...messages.controlTimeSection} />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
