import { TriangleAlertIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
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
import { ContestWithMembersAndProblemsDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";
import { Button } from "@/app/_lib/component/shadcn/button";

type Props = {
  contest: ContestWithMembersAndProblemsDTO;
  leaderboard: LeaderboardResponseDTO;
  form: UseFormReturn<SettingsFormType>;
  isDisabled?: boolean;
};

export function SettingsPageContestTab({ contest, form, isDisabled }: Props) {
  const forceState = useLoadableState();
  const contestStatus = useContestStatusWatcher();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const forceConfirmationDialog = useDialog();

  const languageError = form.formState.errors.contest?.languages?.message;

  async function force(mode: "start" | "end") {
    const method =
      mode === "start"
        ? Composition.contestWritter.forceStart.bind(Composition.contestWritter)
        : Composition.contestWritter.forceEnd.bind(Composition.contestWritter);
    const successMessage =
      mode === "start"
        ? "Contest has been force started."
        : "Contest has been force ended.";
    const errorMessage =
      mode === "start"
        ? "Failed to force start the contest."
        : "Failed to force end the contest.";

    console.debug(`Forcing contest ${mode}. Current status:`, contestStatus);
    forceState.start();

    try {
      const newContestMetadata = await method(contest.id);

      toast.success(successMessage);
      dispatch(
        AdminDashboardSlice.actions.setContest({
          ...contest,
          ...newContestMetadata,
        }),
      );
      dispatch(ContestSlice.actions.set(newContestMetadata));
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
              label="Slug"
              field={<Input data-testid="contest-slug" />}
              description="The slug is used in the URL and must be unique."
            />

            <ControlledField
              form={form}
              name="contest.title"
              label="Title"
              field={<Input data-testid="contest-title" />}
              description="The title of the contest."
            />

            <ControlledField
              form={form}
              name="contest.startAt"
              label="Start At"
              field={
                <Input
                  type="datetime-local"
                  disabled={contestStatus !== ContestStatus.NOT_STARTED}
                  data-testid="contest-start-at"
                />
              }
              description="The date and time when the contest will start."
            />

            <ControlledField
              form={form}
              name="contest.endAt"
              label="End At"
              field={
                <Input type="datetime-local" data-testid="contest-end-at" />
              }
              description="The date and time when the contest will end."
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <FieldLabel>Languages</FieldLabel>
              <FieldDescription>
                Select the programming languages that participants can use in
                the contest.
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
                        label={EnumeratedTextUtil.getSubmissionLanguage(
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
      </FieldSet>

      <Separator className="my-5" />

      <div
        className="flex flex-col gap-3"
        data-testid="contest-management-actions"
      >
        <Button
          type="button"
          variant="secondary"
          data-testid="force-toggle-button"
          onClick={forceConfirmationDialog.open}
          disabled={isDisabled || forceState.isLoading}
        >
          {contestStatus === ContestStatus.NOT_STARTED
            ? "Force Start"
            : "Force End"}
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={forceConfirmationDialog.isOpen}
        icon={<TriangleAlertIcon />}
        title={
          contestStatus === ContestStatus.NOT_STARTED
            ? "Force Start Confirmation"
            : "Force End Confirmation"
        }
        description={
          contestStatus === ContestStatus.NOT_STARTED
            ? "Are you sure you want to force start the contest?"
            : "Are you sure you want to force end the contest?"
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
