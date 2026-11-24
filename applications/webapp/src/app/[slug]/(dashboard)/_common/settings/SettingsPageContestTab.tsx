import { TriangleAlertIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import type { ParseKeys } from "i18next";

import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
import { Checkbox } from "@/app/_lib/component/shadcn/checkbox";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { useDialog } from "@/app/_lib/hook/useDialog";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { ContestSlice } from "@/app/_lib/store/slice/ContestSlice";
import { AdminDashboardSlice } from "@/app/_lib/store/slice/dashboard/AdminDashboardSlice";
import { useAppDispatch } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import {
  languageGroups,
  SubmissionLanguage,
} from "@/domain/enumerate/SubmissionLanguage";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { Button } from "@/app/_lib/component/shadcn/button";
import { ContestUtil } from "@/util/ContestUtil";
import { Switch } from "@/app/_lib/component/shadcn/switch";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { I18nUtil } from "@/app/_lib/util/i18nUtil";

type Props = {
  contest: ContestWithMembersAndProblemsResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  form: UseFormReturn<SettingsFormType>;
  isUpdateLoading?: boolean;
};

export function SettingsPageContestTab({
  contest,
  form,
  isUpdateLoading,
}: Props) {
  const freezeState = useLoadableState();
  const forceState = useLoadableState();
  const contestStatus = useContestStatusWatcher();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const freezeConfirmationDialog = useDialog();
  const forceConfirmationDialog = useDialog();

  const languageError = form.formState.errors.contest?.languages?.message;

  const isContestFrozen = ContestUtil.isFrozen(contest);

  async function toggleFreeze() {
    const method = isContestFrozen
      ? Composition.contestWriter.unfreeze.bind(Composition.contestWriter)
      : Composition.contestWriter.freeze.bind(Composition.contestWriter);
    const successMessage: ParseKeys = isContestFrozen
      ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.unfrozenSuccess"
      : "[slug].(dashboard)._common.settings.SettingsPageContestTab.frozenSuccess";
    const errorMessage: ParseKeys = isContestFrozen
      ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.unfrozenFailed"
      : "[slug].(dashboard)._common.settings.SettingsPageContestTab.frozenFailed";

    console.debug("Toggling freeze. Current state:", isContestFrozen);
    freezeState.start();

    try {
      const updatedContest = await method(contest.id);

      toast.success(successMessage);
      dispatch(AdminDashboardSlice.actions.setContest(updatedContest));
      dispatch(ContestSlice.actions.set(updatedContest));
      form.reset(SettingsForm.fromResponseDTO(updatedContest));
      freezeConfirmationDialog.close();
      freezeState.finish();

      console.debug("Freeze toggled successfully");
    } catch (error) {
      await freezeState.fail(error, {
        default: () => toast.error(errorMessage),
      });
    }
  }

  async function force(mode: "start" | "end") {
    const method =
      mode === "start"
        ? Composition.contestWriter.forceStart.bind(Composition.contestWriter)
        : Composition.contestWriter.forceEnd.bind(Composition.contestWriter);
    const successMessage: ParseKeys =
      mode === "start"
        ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceStartSuccess"
        : "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceEndSuccess";
    const errorMessage: ParseKeys =
      mode === "start"
        ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceStartFailed"
        : "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceEndFailed";

    console.debug(`Forcing contest ${mode}. Current status:`, contestStatus);
    forceState.start();

    try {
      const updatedContest = await method(contest.id);

      toast.success(successMessage);
      dispatch(AdminDashboardSlice.actions.setContest(updatedContest));
      dispatch(ContestSlice.actions.set(updatedContest));
      form.reset(SettingsForm.fromResponseDTO(updatedContest));
      forceConfirmationDialog.close();
      forceState.finish();

      console.debug(`Contest force ${mode}ed successfully`);
    } catch (error) {
      await forceState.fail(error, {
        default: () => toast.error(errorMessage),
      });
    }
  }

  const hasContestEnded = contestStatus === ContestStatus.ENDED;

  return (
    <>
      <FieldSet disabled={isUpdateLoading || hasContestEnded}>
        <div className="flex flex-col gap-4" data-testid="settings-contest-tab">
          <div className="grid grid-cols-2 gap-6">
            <ControlledField
              form={form}
              name="contest.slug"
              label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelSlug"
              field={<Input data-testid="contest-slug" />}
              description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionSlug"
            />

            <ControlledField
              form={form}
              name="contest.title"
              label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelTitle"
              field={<Input data-testid="contest-title" />}
              description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionTitle"
            />

            <ControlledField
              form={form}
              name="contest.startAt"
              label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelStartAt"
              field={
                <Input
                  type="datetime-local"
                  disabled={contestStatus !== ContestStatus.NOT_STARTED}
                  data-testid="contest-start-at"
                />
              }
              description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionStartAt"
            />

            <ControlledField
              form={form}
              name="contest.endAt"
              label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelEndAt"
              field={
                <Input type="datetime-local" data-testid="contest-end-at" />
              }
              description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionEndAt"
            />

            <ControlledField
              form={form}
              name="contest.autoFreezeAt"
              label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelAutoFreezeAt"
              field={
                <Input
                  type="datetime-local"
                  data-testid="contest-auto-freeze-at"
                  disabled={isContestFrozen}
                />
              }
              description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionAutoFreezeAt"
            />

            <ControlledField
              form={form}
              name="contest.ipCIDRs"
              label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelIpCIDRs"
              field={<Input data-testid="contest-ip-cidrs" />}
              description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionIpCIDRs"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <FieldLabel>
                <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelLanguages" />
              </FieldLabel>
              <FieldDescription>
                <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionLanguages" />
              </FieldDescription>
              {languageError && <FieldError>{languageError}</FieldError>}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {languageGroups.map((group) => (
                <div key={group}>
                  {Object.keys(SubmissionLanguage)
                    .filter((lang) => lang.startsWith(group))
                    .map((lang) => (
                      <ControlledField
                        key={lang}
                        form={form}
                        name={`contest.languages.${lang}` as any}
                        label={I18nUtil.getSubmissionLanguage(
                          lang as SubmissionLanguage,
                        )}
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
          </div>
        </div>

        <Separator />

        <div>
          <ControlledField
            form={form}
            name="contest.settings.isAutoJudgeEnabled"
            label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelIsAutoJudgeEnabled"
            field={<Switch data-testid="contest-auto-judge-enabled" />}
            description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionIsAutoJudgeEnabled"
          />

          <ControlledField
            form={form}
            name="contest.settings.isClarificationEnabled"
            label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelIsClarificationEnabled"
            field={<Switch data-testid="contest-clarification-enabled" />}
            description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionIsClarificationEnabled"
          />

          <ControlledField
            form={form}
            name="contest.settings.isPrintRequestEnabled"
            label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelIsPrintRequestEnabled"
            field={<Switch data-testid="contest-print-request-enabled" />}
            description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionIsPrintRequestEnabled"
          />

          <ControlledField
            form={form}
            name="contest.settings.isSpectatorEnabled"
            label="[slug].(dashboard)._common.settings.SettingsPageContestTab.labelIsSpectatorEnabled"
            field={<Switch data-testid="contest-spectator-enabled" />}
            description="[slug].(dashboard)._common.settings.SettingsPageContestTab.descriptionIsSpectatorEnabled"
          />
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
          disabled={
            isUpdateLoading ||
            freezeState.isLoading ||
            (isContestFrozen && contestStatus === ContestStatus.NOT_STARTED) ||
            (!isContestFrozen && contestStatus !== ContestStatus.IN_PROGRESS)
          }
        >
          {isContestFrozen ? (
            <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageContestTab.buttonUnfreeze" />
          ) : (
            <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageContestTab.buttonFreeze" />
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          data-testid="force-toggle-button"
          onClick={forceConfirmationDialog.open}
          disabled={isUpdateLoading || hasContestEnded || forceState.isLoading}
        >
          {contestStatus === ContestStatus.NOT_STARTED ? (
            <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageContestTab.buttonForceStart" />
          ) : (
            <FormattedMessage id="[slug].(dashboard)._common.settings.SettingsPageContestTab.buttonForceEnd" />
          )}
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={freezeConfirmationDialog.isOpen}
        icon={<TriangleAlertIcon />}
        title={
          isContestFrozen
            ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.unfreezeDialogTitle"
            : "[slug].(dashboard)._common.settings.SettingsPageContestTab.freezeDialogTitle"
        }
        description={
          isContestFrozen
            ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.unfreezeDialogDescription"
            : "[slug].(dashboard)._common.settings.SettingsPageContestTab.freezeDialogDescription"
        }
        onCancel={freezeConfirmationDialog.close}
        onConfirm={toggleFreeze}
        isLoading={freezeState.isLoading}
        data-testid="freeze-confirmation-dialog"
      />

      <ConfirmationDialog
        isOpen={forceConfirmationDialog.isOpen}
        icon={<TriangleAlertIcon />}
        title={
          contestStatus === ContestStatus.NOT_STARTED
            ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceStartDialogTitle"
            : "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceEndDialogTitle"
        }
        description={
          contestStatus === ContestStatus.NOT_STARTED
            ? "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceStartDialogDescription"
            : "[slug].(dashboard)._common.settings.SettingsPageContestTab.forceEndDialogDescription"
        }
        onCancel={forceConfirmationDialog.close}
        onConfirm={() =>
          force(contestStatus === ContestStatus.NOT_STARTED ? "start" : "end")
        }
        isLoading={forceState.isLoading}
        data-testid="force-confirmation-dialog"
      />
    </>
  );
}
