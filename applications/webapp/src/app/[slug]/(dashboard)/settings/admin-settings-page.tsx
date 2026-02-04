"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { SettingsFormMapper } from "@/app/[slug]/(dashboard)/settings/_form/settings-form-mapper";
import { settingsFormSchema } from "@/app/[slug]/(dashboard)/settings/_form/settings-form-schema";
import { ContestSettings } from "@/app/[slug]/(dashboard)/settings/_tab/contest-settings";
import { MembersSettings } from "@/app/[slug]/(dashboard)/settings/_tab/members-settings";
import { ProblemsSettings } from "@/app/[slug]/(dashboard)/settings/_tab/problems-settings";
import { Badge } from "@/app/_lib/component/base/display/badge";
import { Card } from "@/app/_lib/component/base/display/card";
import { Alert } from "@/app/_lib/component/base/feedback/alert";
import { Button } from "@/app/_lib/component/base/form/button";
import { Divider } from "@/app/_lib/component/base/layout/divider";
import { Tabs } from "@/app/_lib/component/base/navigation/tabs";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Metadata } from "@/app/_lib/component/metadata";
import { ConfirmationModal } from "@/app/_lib/component/modal/confirmation-modal";
import { useContestStatusWatcher } from "@/app/_lib/util/contest-status-watcher";
import { useLoadableState } from "@/app/_lib/util/loadable-state";
import { useModal } from "@/app/_lib/util/modal-hook";
import { TestCaseValidator } from "@/app/_lib/util/test-case-validator";
import { useToast } from "@/app/_lib/util/toast-hook";
import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { contestMetadataSlice } from "@/app/_store/slices/contest-metadata-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { contestWritter, leaderboardReader } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.page-title",
    defaultMessage: "Forseti - Settings",
  },
  pageDescription: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.page-description",
    defaultMessage: "Configure the settings for the contest.",
  },
  tabContest: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.tab-contest",
    defaultMessage: "Contest",
  },
  tabProblems: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.tab-problems",
    defaultMessage: "Problems",
  },
  tabMembers: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.tab-members",
    defaultMessage: "Members",
  },
  resetLabel: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.reset-label",
    defaultMessage: "Reset Changes",
  },
  saveLabel: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-label",
    defaultMessage: "Save Changes",
  },
  saveModalTitle: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-modal-title",
    defaultMessage: "Save Changes",
  },
  saveModalBody: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-modal-body",
    defaultMessage: "Are you sure you want to save these changes?",
  },
  saveModalAlertTitle: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-modal-alert-title",
    defaultMessage: "Attention",
  },
  saveModalAlertBody: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-modal-alert-body",
    defaultMessage:
      "This action will modify contest data while the contest is in progress. This could affect participants and their submissions. Please proceed with caution.",
  },
  saveSuccess: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-success",
    defaultMessage: "Changes saved successfully",
  },
  saveError: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-error",
    defaultMessage: "Failed to save changes",
  },
  saveSlugInUse: {
    id: "app.[slug].(dashboard).settings.admin-settings-page.save-slug-in-use",
    defaultMessage: "This slug is already in use",
  },
});

enum TabKey {
  CONTEST = "CONTEST",
  PROBLEMS = "PROBLEMS",
  MEMBERS = "MEMBERS",
}

/**
 * Displays the admin settings page for a contest.
 * Allows administrators to configure contest settings, manage problems, and members.
 */
export function AdminSettingsPage() {
  const saveState = useLoadableState();
  const validationState = useLoadableState();
  const contest = useAppSelector((state) => state.adminDashboard.contest);

  const toast = useToast();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const contestStatus = useContestStatusWatcher();

  const [selectedTab, setSelectedTab] = useState<TabKey>(TabKey.CONTEST);
  const saveModal = useModal<SettingsForm>();
  const form = useForm<SettingsForm>({
    resolver: joiResolver(settingsFormSchema(contestStatus)),
  });

  function reset() {
    form.reset(SettingsFormMapper.fromResponseDTOToForm(contest));
  }

  useEffect(() => {
    reset();
  }, [contest]);

  async function updateContest(data: SettingsForm) {
    saveState.start();
    try {
      const inputDTO = SettingsFormMapper.fromFormToInputDTO(data);
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
        saveModal.close();
        saveState.finish();
      }
    } catch (error) {
      saveState.fail(error as Error, {
        [ConflictException.name]: () => toast.error(messages.saveSlugInUse),
        default: () => toast.error(messages.saveError),
      });
    }
  }

  async function onSubmit(data: SettingsForm) {
    validationState.start();
    /**
     * Validate all new test cases concurrently
     */
    const results = await Promise.all(
      data.problems.map(async (it, idx) => {
        const isValid =
          !it.newTestCases ||
          it.newTestCases.length === 0 ||
          (await TestCaseValidator.validate(it.newTestCases[0]));
        if (!isValid) {
          form.setError(`problems.${idx}.newTestCases`, {
            type: "manual",
            message: "Invalid test cases",
          });
        }
        return isValid;
      }),
    );
    validationState.finish();
    if (results.every((it) => it)) {
      saveModal.open(data);
    }
  }

  const {
    problems: problemsErrors,
    members: membersErrors,
    ...contestErrors
  } = form.formState.errors;

  return (
    <>
      <Metadata
        title={messages.pageTitle}
        description={messages.pageDescription}
      />
      <Card shadow="none" radius="sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card.Header>
            <Tabs
              fullWidth
              variant="underlined"
              color="primary"
              defaultSelectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as TabKey)}
              data-testid="settings-nav"
            >
              <Tabs.Item
                key={TabKey.CONTEST}
                title={
                  <Badge
                    color="danger"
                    content=""
                    className="-right-2"
                    hidden={!Object.keys(contestErrors).length}
                  >
                    <FormattedMessage {...messages.tabContest} />
                  </Badge>
                }
                data-testid="tab"
              />
              <Tabs.Item
                key={TabKey.PROBLEMS}
                title={
                  <Badge
                    color="danger"
                    content=""
                    className="-right-2"
                    hidden={!problemsErrors}
                  >
                    <FormattedMessage {...messages.tabProblems} />
                  </Badge>
                }
                data-testid="tab"
              />
              <Tabs.Item
                key={TabKey.MEMBERS}
                title={
                  <Badge
                    color="danger"
                    content=""
                    className="-right-2"
                    hidden={!membersErrors}
                  >
                    <FormattedMessage {...messages.tabMembers} />
                  </Badge>
                }
                data-testid="tab"
              />
            </Tabs>
          </Card.Header>
          <Divider />
          <Card.Body>
            <ContestSettings
              contest={contest}
              form={form}
              isOpen={selectedTab === TabKey.CONTEST}
            />
            <ProblemsSettings
              form={form}
              isOpen={selectedTab === TabKey.PROBLEMS}
            />
            <MembersSettings
              form={form}
              isOpen={selectedTab === TabKey.MEMBERS}
            />
          </Card.Body>
          <Divider />
          <Card.Footer className="flex justify-end">
            <Button
              color="danger"
              variant="flat"
              className="mr-3"
              onPress={reset}
              data-testid="reset"
            >
              <FormattedMessage {...messages.resetLabel} />
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={validationState.isLoading}
              isDisabled={
                /* Does not allow saving if contest has ended */
                contestStatus === ContestStatus.ENDED
              }
              data-testid="save"
            >
              <FormattedMessage {...messages.saveLabel} />
            </Button>
          </Card.Footer>
        </form>

        {/* Save Confirmation Modal */}
        <ConfirmationModal
          isOpen={saveModal.isOpen}
          isLoading={saveState.isLoading}
          onClose={saveModal.close}
          title={<FormattedMessage {...messages.saveModalTitle} />}
          body={
            <>
              {/* Show an extra alert if the contest is in progress */}
              {contestStatus === ContestStatus.IN_PROGRESS && (
                <Alert
                  color="danger"
                  title={<FormattedMessage {...messages.saveModalAlertTitle} />}
                  description={
                    <FormattedMessage {...messages.saveModalAlertBody} />
                  }
                  data-testid="in-progress-alert"
                />
              )}
              <FormattedMessage {...messages.saveModalBody} />
            </>
          }
          onConfirm={() => updateContest(saveModal.props)}
          data-testid="save-confirmation-modal"
        />
      </Card>
    </>
  );
}
