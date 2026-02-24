import { PlusIcon, TrashIcon, UploadIcon } from "lucide-react";
import { useRef } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { FieldSet } from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/app/_lib/component/shadcn/native-select";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_lib/component/shadcn/tooltip";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { MemberLoader } from "@/app/_lib/util/member-loader";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  loadCsvLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.load-csv-label",
    defaultMessage: "Load from CSV",
  },
  loadCsvError: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.load-csv-error",
    defaultMessage: "Failed to load members from CSV.",
  },
  titleLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.title-label",
    defaultMessage: "Name",
  },
  typeLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.type-label",
    defaultMessage: "Type",
  },
  loginLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.login-label",
    defaultMessage: "Login",
  },
  passwordLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.password-label",
    defaultMessage: "Password",
  },
  newMemberLabel: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.new-member-label",
    defaultMessage: "New Member",
  },
  removeTooltip: {
    id: "app.[slug].(dashboard)._common.settings.settings-page-members-tab.remove-tooltip",
    defaultMessage: "Remove",
  },
});

type Props = {
  form: UseFormReturn<SettingsFormType>;
  isDisabled?: boolean;
};

export function SettingsPageMembersTab({ form, isDisabled }: Props) {
  const loadCsvState = useLoadableState();
  const memberFileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "members",
  });

  async function loadCsv(file: File) {
    console.debug("Starting to load members from CSV file:", file.name);
    loadCsvState.start();

    try {
      const members = await MemberLoader.loadFromCsv(file);
      replace(members);
      if (memberFileInputRef.current) {
        memberFileInputRef.current.value = "";
      }
      loadCsvState.finish();
      console.debug("Members loaded successfully from CSV file:", members);
    } catch (error) {
      await loadCsvState.fail(error, {
        default: () => toast.error(messages.loadCsvError),
      });
    }
  }

  return (
    <FieldSet disabled={isDisabled}>
      <div className="flex flex-col gap-4" data-testid="settings-members-tab">
        <div className="flex justify-end">
          <Input
            className="hidden"
            ref={memberFileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) =>
              e.target.files?.[0] && loadCsv(e.target.files?.[0] as File)
            }
            data-testid="member-file-input"
          />
          <AsyncButton
            type="button"
            variant="outline"
            onClick={() => memberFileInputRef.current?.click()}
            isLoading={loadCsvState.isLoading}
          >
            <FormattedMessage {...messages.loadCsvLabel} />
            <UploadIcon />
          </AsyncButton>
        </div>
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>
                <FormattedMessage {...messages.titleLabel} />
              </TableHead>
              <TableHead>
                <FormattedMessage {...messages.typeLabel} />
              </TableHead>
              <TableHead>
                <FormattedMessage {...messages.loginLabel} />
              </TableHead>
              <TableHead>
                <FormattedMessage {...messages.passwordLabel} />
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id} data-testid="member-row">
                <TableCell>
                  <ControlledField
                    className="gap-0"
                    form={form}
                    name={`members.${index}.name`}
                    field={<Input data-testid="member-name" />}
                  />
                </TableCell>
                <TableCell>
                  <ControlledField
                    className="gap-0"
                    form={form}
                    name={`members.${index}.type`}
                    field={
                      <NativeSelect data-testid="member-type">
                        <NativeSelectOption value="" />
                        {Object.keys(MemberType)
                          .filter((type) => type !== MemberType.ROOT)
                          .map((type) => (
                            <NativeSelectOption key={type} value={type}>
                              <FormattedMessage
                                {...globalMessages.memberType[
                                  type as MemberType
                                ]}
                              />
                            </NativeSelectOption>
                          ))}
                      </NativeSelect>
                    }
                  />
                </TableCell>
                <TableCell>
                  <ControlledField
                    className="gap-0"
                    form={form}
                    name={`members.${index}.login`}
                    field={<Input data-testid="member-login" />}
                  />
                </TableCell>
                <TableCell>
                  <ControlledField
                    className="gap-0"
                    form={form}
                    name={`members.${index}.password`}
                    field={
                      <Input
                        type="password"
                        placeholder={field._id ? "********" : ""}
                        data-testid="member-password"
                      />
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="xs"
                        variant="destructive"
                        onClick={() => remove(index)}
                        data-testid="remove-member-button"
                      >
                        <TrashIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <FormattedMessage {...messages.removeTooltip} />
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator />
        <Button
          type="button"
          onClick={() =>
            append({
              name: "",
              type: "" as MemberType,
              login: "",
              password: "",
            })
          }
          data-testid="add-member-button"
        >
          <PlusIcon />
          <FormattedMessage {...messages.newMemberLabel} />
        </Button>
      </div>
    </FieldSet>
  );
}
