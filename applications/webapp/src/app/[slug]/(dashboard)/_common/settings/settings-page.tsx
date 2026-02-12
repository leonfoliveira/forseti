"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { SettingsPageContestTab } from "@/app/[slug]/(dashboard)/_common/settings/settings-page-contest-tab";
import { SettingsPageMembersTab } from "@/app/[slug]/(dashboard)/_common/settings/settings-page-members-tab";
import { SettingsPageProblemsTab } from "@/app/[slug]/(dashboard)/_common/settings/settings-page-problems-tab";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/confirmation-dialog";
import { Form } from "@/app/_lib/component/form/form";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/app/_lib/component/shadcn/alert";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Card, CardFooter } from "@/app/_lib/component/shadcn/card";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Tabs, TabsList, TabsTrigger } from "@/app/_lib/component/shadcn/tabs";
import { useContestStatusWatcher } from "@/app/_lib/hook/contest-status-watcher-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { cn } from "@/app/_lib/util/cn";
import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { contestMetadataSlice } from "@/app/_store/slices/contest-metadata-slice";
import { useAppDispatch } from "@/app/_store/store";
import { contestWritter, leaderboardReader } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  title: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.title",
    defaultMessage: "Forseti - Settings",
  },
  description: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.description",
    defaultMessage: "Manage your contest settings and preferences.",
  },
  contestTab: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.contest-tab",
    defaultMessage: "Contest",
  },
  problemsTab: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.problems-tab",
    defaultMessage: "Problems",
  },
  membersTab: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.members-tab",
    defaultMessage: "Members",
  },
  resetLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.reset-label",
    defaultMessage: "Reset",
  },
  saveLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.save-label",
    defaultMessage: "Save",
  },
  saveSuccess: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.save-success",
    defaultMessage: "Settings saved successfully.",
  },
  saveError: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.save-error",
    defaultMessage: "Failed to save settings.",
  },
  confirmDialogTitle: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.confirm-dialog-title",
    defaultMessage: "Confirm Changes",
  },
  confirmDialogDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.confirm-dialog-description",
    defaultMessage: "Are you sure you want to save these changes?",
  },
  confirmDialogInProgressAlertTitle: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.confirm-dialog-in-progress-alert-title",
    defaultMessage: "Contest In Progress",
  },
  confirmDialogInProgressAlertDescription: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.confirm-dialog-in-progress-alert-description",
    defaultMessage:
      "This contest is currently in progress. Changing the settings may affect the contest experience for participants. Please review your changes carefully before confirming.",
  },
  confirmDialogCancel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.confirm-dialog-cancel",
    defaultMessage: "Cancel",
  },
  confirmDialogConfirm: {
    id: "app.[slug].(dashboard)._common.settings.settings-page.confirm-dialog-confirm",
    defaultMessage: "Yes, Save Changes",
  },
});

type Props = {
  contest: ContestFullResponseDTO;
};

enum TabKey {
  CONTEST = "contest",
  PROBLEMS = "problems",
  MEMBERS = "members",
}

export function SettingsPage({ contest }: Props) {
  const contestStatus = useContestStatusWatcher();
  const updateContestState = useLoadableState();
  const toast = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedTab, setSelectedTab] = useState<TabKey>(TabKey.CONTEST);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const form = useForm<SettingsFormType>({
    resolver: joiResolver(SettingsForm.schema(contestStatus)),
    defaultValues: SettingsForm.fromResponseDTO(contest),
  });

  function reset() {
    form.reset(SettingsForm.fromResponseDTO(contest));
  }

  useEffect(() => {
    reset();
  }, [contest]);

  async function updateSettings(data: SettingsFormType) {
    updateContestState.start();
    try {
      const inputDTO = SettingsForm.toInputDTO(data);
      if (contestStatus !== ContestStatus.NOT_STARTED) {
        inputDTO.startAt = contest.startAt;
      }
      const newContest = await contestWritter.update(contest.id, inputDTO);

      if (newContest.slug !== contest.slug) {
        /* Redirect to new path if slug has changed */
        router.push(routes.CONTEST_SETTINGS(newContest.slug));
      } else {
        const leaderboard = await leaderboardReader.build(newContest.id);

        dispatch(contestMetadataSlice.actions.set(newContest));
        dispatch(adminDashboardSlice.actions.setContest(newContest));
        dispatch(adminDashboardSlice.actions.setLeaderboard(leaderboard));

        toast.success(messages.saveSuccess);
        setIsConfirmDialogOpen(false);
      }
      updateContestState.finish();
    } catch (error) {
      updateContestState.fail(error, {
        default: () => toast.error(messages.saveError),
      });
    }
  }

  const hasContestValidationError = !!form.formState.errors.contest;
  const hasProblemsValidationError = !!form.formState.errors.problems;
  const hasMembersValidationError = !!form.formState.errors.members;

  return (
    <Page title={messages.title} description={messages.description}>
      <div className="py-5">
        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as TabKey)}
          className="border-placeholder items-center"
        >
          <TabsList className="bg-card border-placeholder border">
            <TabsTrigger
              value="contest"
              data-testid="settings-contest-tab-trigger"
            >
              <p
                className={cn(hasContestValidationError && "text-destructive")}
              >
                <FormattedMessage {...messages.contestTab} />
              </p>
            </TabsTrigger>
            <TabsTrigger
              value="problems"
              data-testid="settings-problems-tab-trigger"
            >
              <p
                className={cn(hasProblemsValidationError && "text-destructive")}
              >
                <FormattedMessage {...messages.problemsTab} />
              </p>
            </TabsTrigger>
            <TabsTrigger
              value="members"
              data-testid="settings-members-tab-trigger"
            >
              <p
                className={cn(hasMembersValidationError && "text-destructive")}
              >
                <FormattedMessage {...messages.membersTab} />
              </p>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Form onSubmit={form.handleSubmit(() => setIsConfirmDialogOpen(true))}>
          <FieldSet
            disabled={
              updateContestState.isLoading ||
              contestStatus === ContestStatus.ENDED
            }
          >
            <Card className="mt-5 w-full">
              {selectedTab === TabKey.CONTEST && (
                <SettingsPageContestTab contest={contest} form={form} />
              )}

              {selectedTab === TabKey.PROBLEMS && (
                <SettingsPageProblemsTab contest={contest} form={form} />
              )}

              {selectedTab === TabKey.MEMBERS && (
                <SettingsPageMembersTab form={form} />
              )}

              <Separator />
              <CardFooter className="justify-end gap-3">
                <Button type="button" variant="outline" onClick={reset}>
                  <FormattedMessage {...messages.resetLabel} />
                </Button>
                <Button type="submit" data-testid="save-settings-button">
                  <FormattedMessage {...messages.saveLabel} />
                </Button>

                <ConfirmationDialog
                  isOpen={isConfirmDialogOpen}
                  title={messages.confirmDialogTitle}
                  description={messages.confirmDialogDescription}
                  content={
                    contestStatus !== ContestStatus.NOT_STARTED && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle />
                        <AlertTitle>
                          <FormattedMessage
                            {...messages.confirmDialogInProgressAlertTitle}
                          />
                        </AlertTitle>
                        <AlertDescription>
                          <FormattedMessage
                            {...messages.confirmDialogInProgressAlertDescription}
                          />
                        </AlertDescription>
                      </Alert>
                    )
                  }
                  onCancel={() => setIsConfirmDialogOpen(false)}
                  onConfirm={form.handleSubmit(updateSettings)}
                  isLoading={updateContestState.isLoading}
                />
              </CardFooter>
            </Card>
          </FieldSet>
        </Form>
      </div>
    </Page>
  );
}
