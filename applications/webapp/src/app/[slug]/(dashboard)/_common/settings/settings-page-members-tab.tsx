import { Plus, Trash } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { CardContent } from "@/app/_lib/component/shadcn/card";
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
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
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
});

type Props = {
  form: UseFormReturn<SettingsFormType>;
};

export function SettingsPageMembersTab({ form }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  return (
    <CardContent
      className="flex flex-col gap-4"
      data-testid="settings-members-tab"
    >
      <Table>
        <TableHeader className="bg-content2">
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
                      {Object.keys(MemberType)
                        .filter((type) => type !== MemberType.ROOT)
                        .map((type) => (
                          <NativeSelectOption key={type} value={type}>
                            <FormattedMessage
                              {...globalMessages.memberType[type as MemberType]}
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
                <Button
                  type="button"
                  size="xs"
                  variant="destructive"
                  onClick={() => remove(index)}
                  data-testid="remove-member-button"
                >
                  <Trash />
                </Button>
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
            type: MemberType.CONTESTANT,
            login: "",
            password: "",
          })
        }
        data-testid="add-member-button"
      >
        <Plus />
        <FormattedMessage {...messages.newMemberLabel} />
      </Button>
    </CardContent>
  );
}
