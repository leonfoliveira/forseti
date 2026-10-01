"use client";

import clsx from "clsx";
import { joiResolver } from "@hookform/resolvers/joi";
import { AlertCircleIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { SettingsPageContestTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageContestTab";
import { SettingsPageMembersTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageMembersTab";
import { SettingsPageProblemsTab } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPageProblemsTab";
import { ConfirmationDialog } from "@/app/_lib/component/feedback/ConfirmationDialog";
import { Form } from "@/app/_lib/component/form/Form";
import { Page } from "@/app/_lib/component/page/Page";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/app/_lib/component/shadcn/alert";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/app/_lib/component/shadcn/card";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { Tabs, TabsList, TabsTrigger } from "@/app/_lib/component/shadcn/tabs";
import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { ContestSlice } from "@/app/_store/slice/ContestSlice";
import { AdminDashboardSlice } from "@/app/_store/slice/dashboard/AdminDashboardSlice";
import { useAppDispatch } from "@/app/_store/Store";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { ObjectUtil } from "@/util/ObjectUtil";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { ContestWithMembersAndProblemsDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";

type Props = {
  contest: ContestWithMembersAndProblemsDTO;
  leaderboard: LeaderboardResponseDTO;
};

enum TabKey {
  CONTEST = "contest",
  PROBLEMS = "problems",
  MEMBERS = "members",
}

export function SettingsPage({ contest, leaderboard }: Props) {
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
      const updatedContest = await Composition.contestWritter.update(
        contest.id,
        inputDTO,
      );

      if (updatedContest.slug !== contest.slug) {
        /* Redirect to new path if slug has changed */
        router.push(routes.CONTEST_SETTINGS(updatedContest.slug));
      } else {
        const dashboard = await Composition.dashboardReader.getAdminDashboard(
          contest.id,
        );

        dispatch(
          ContestSlice.actions.set(
            ObjectUtil.removeKeys(updatedContest, "members", "problems"),
          ),
        );
        dispatch(AdminDashboardSlice.actions.set(dashboard));

        toast.success("");
        setIsConfirmDialogOpen(false);
      }
      updateContestState.finish("Settings saved successfully.");
    } catch (error) {
      await updateContestState.fail(error, {
        default: () => toast.error("Failed to save settings."),
      });
    }
  }

  const hasContestValidationError = !!form.formState.errors.contest;
  const hasProblemsValidationError = !!form.formState.errors.problems;
  const hasMembersValidationError = !!form.formState.errors.members;

  const isDisabled =
    updateContestState.isLoading || contestStatus === ContestStatus.ENDED;

  return (
    <Page title="Settings" description="Manage contest settings">
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
                className={clsx(
                  hasContestValidationError && "text-destructive",
                )}
              >
                Contest
              </p>
            </TabsTrigger>
            <TabsTrigger
              value="problems"
              data-testid="settings-problems-tab-trigger"
            >
              <p
                className={clsx(
                  hasProblemsValidationError && "text-destructive",
                )}
              >
                Problems
              </p>
            </TabsTrigger>
            <TabsTrigger
              value="members"
              data-testid="settings-members-tab-trigger"
            >
              <p
                className={clsx(
                  hasMembersValidationError && "text-destructive",
                )}
              >
                Members
              </p>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Form onSubmit={form.handleSubmit(() => setIsConfirmDialogOpen(true))}>
          <Card className="mt-5 w-full">
            <CardContent>
              {contestStatus === ContestStatus.IN_PROGRESS && (
                <Alert className="mb-5 bg-red-50 dark:bg-red-100">
                  <AlertCircleIcon className="stroke-red-500 dark:stroke-red-600" />
                  <AlertDescription className="text-red-600 dark:text-red-700">
                    Contest is currently in progress. Changes may affect the
                    ongoing contest.
                  </AlertDescription>
                </Alert>
              )}

              {selectedTab === TabKey.CONTEST && (
                <SettingsPageContestTab
                  contest={contest}
                  leaderboard={leaderboard}
                  form={form}
                  isDisabled={isDisabled}
                />
              )}

              {selectedTab === TabKey.PROBLEMS && (
                <SettingsPageProblemsTab
                  contest={contest}
                  form={form}
                  isDisabled={isDisabled}
                />
              )}

              {selectedTab === TabKey.MEMBERS && (
                <SettingsPageMembersTab form={form} isDisabled={isDisabled} />
              )}
            </CardContent>

            <Separator />
            <CardFooter className="justify-end gap-3">
              <Button type="button" variant="outline" onClick={reset}>
                Reset
              </Button>
              <Button type="submit" data-testid="save-settings-button">
                Save
                <SaveIcon />
              </Button>

              <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                title="Confirm Changes"
                description="Are you sure you want to apply these changes?"
                content={
                  contestStatus !== ContestStatus.NOT_STARTED && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircleIcon />
                      <AlertTitle>Contest In Progress</AlertTitle>
                      <AlertDescription>
                        This contest is currently in progress. Changing the
                        settings may affect the contest experience for
                        participants. Please review your changes carefully
                        before confirming.
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
        </Form>
      </div>
    </Page>
  );
}
