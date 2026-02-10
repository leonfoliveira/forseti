import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";

import { SettingsPageContestTab } from "@/app/[slug]/(dashboard)/_common/settings/contest/settings-page-contest-tab";
import {
  SettingsForm,
  SettingsFormType,
} from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { Page } from "@/app/_lib/component/page/page";
import { useContestStatusWatcher } from "@/app/_lib/util/contest-status-watcher";
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
});

type Props = {
  contest: ContestFullResponseDTO;
};

export function SettingsPage({ contest }: Props) {
  const contestStatus = useContestStatusWatcher();
  const form = useForm<SettingsFormType>({
    resolver: joiResolver(SettingsForm.schema(contestStatus)),
  });

  return (
    <Page title={messages.title} description={messages.description}>
      <SettingsPageContestTab contest={contest} form={form} />
    </Page>
  );
}
