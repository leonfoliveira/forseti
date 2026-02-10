import { UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({});

type Props = {
  contest: ContestFullResponseDTO;
  form: UseFormReturn<SettingsFormType>;
};

export function SettingsPageContestTab({ contest, form }: Props) {
  return null;
}
