import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Button, Chip, Input, Select, SelectItem } from "@heroui/react";
import React from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsForm } from "@/app/[slug]/(dashboard)/settings/_form/settings-form";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";
import { FormField } from "@/lib/component/form/form-field";
import { Label } from "@/lib/component/form/label";
import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { useIntl } from "@/lib/util/intl-hook";

const messages = defineMessages({
  sectionTitle: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.section-title",
    defaultMessage: "Contest Members",
  },
  sectionDescription: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.section-description",
    defaultMessage:
      "Manage participants and their access levels for this contest.",
  },
  typeLabel: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.type-label",
    defaultMessage: "Type",
  },
  nameLabel: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.name-label",
    defaultMessage: "Name",
  },
  loginLabel: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.login-label",
    defaultMessage: "Login",
  },
  passwordLabel: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.password-label",
    defaultMessage: "Password",
  },
  actionsLabel: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.actions-label",
    defaultMessage: "Actions",
  },
  newMemberLabel: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.new-member-label",
    defaultMessage: "Add Member",
  },
  emptyStateTitle: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.empty-state-title",
    defaultMessage: "No Members Added Yet",
  },
  emptyStateDescription: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.empty-state-description",
    defaultMessage:
      "Start by adding contest participants. You can assign different roles and access levels.",
  },
  addFirstMemberLabel: {
    id: "app.[slug].(dashboard).settings._tabs.members-settings.add-first-member-label",
    defaultMessage: "Add First Member",
  },
});

type Props = {
  form: UseFormReturn<SettingsForm>;
};

export function MembersSettings({ form }: Props) {
  const intl = useIntl();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="members-settings">
      {/* Header Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          <FormattedMessage {...messages.sectionTitle} />
        </h3>
        <p className="text-sm text-foreground/60">
          <FormattedMessage {...messages.sectionDescription} />
        </p>
      </div>

      {/* Members Table or Empty State */}
      {fields.length > 0 ? (
        <div className="space-y-4">
          <div className="grid [grid-template-columns:auto_1fr] lg:[grid-template-columns:auto_repeat(4,1fr)_auto] gap-y-3 lg:gap-x-3 grid-flow-row-dense items-center">
            <div className="hidden lg:block"></div>
            <Label className="hidden lg:block">
              <FormattedMessage {...messages.typeLabel} />
            </Label>
            <Label className="hidden lg:block">
              <FormattedMessage {...messages.nameLabel} />
            </Label>
            <Label className="hidden lg:block">
              <FormattedMessage {...messages.loginLabel} />
            </Label>
            <Label className="hidden lg:block">
              <FormattedMessage {...messages.passwordLabel} />
            </Label>
            <div className="hidden lg:block"></div>
            {fields.map((member, index) => (
              <React.Fragment key={member.id}>
                <div className="flex" data-testid="member">
                  <Chip size="sm" color="primary" variant="flat">
                    #{index + 1}
                  </Chip>
                  <div className="h-6 w-px bg-divider ml-3 mr-1" />
                </div>
                <Button
                  isIconOnly
                  color="danger"
                  variant="light"
                  size="sm"
                  onPress={() => remove(index)}
                  className="lg:-col-end-1"
                  data-testid="remove-member"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
                <FormField form={form} name={`members.${index}.type`} isSelect>
                  <Select
                    className="col-span-2 lg:col-span-1"
                    classNames={{ label: "lg:hidden" }}
                    size="sm"
                    labelPlacement="outside-left"
                    label={<FormattedMessage {...messages.typeLabel} />}
                  >
                    {Object.keys(MemberType)
                      .filter((it) => it !== MemberType.ROOT)
                      .map((it) => (
                        <SelectItem key={it}>
                          {intl.formatMessage(
                            globalMessages.memberType[it as MemberType],
                          )}
                        </SelectItem>
                      ))}
                  </Select>
                </FormField>
                <FormField form={form} name={`members.${index}.name`}>
                  <Input
                    className="col-span-2 lg:col-span-1"
                    classNames={{
                      mainWrapper: "flex-1",
                      label: "pl-0 lg:hidden",
                    }}
                    size="sm"
                    labelPlacement="outside-left"
                    label={<FormattedMessage {...messages.nameLabel} />}
                  />
                </FormField>
                <FormField form={form} name={`members.${index}.login`}>
                  <Input
                    className="col-span-2 lg:col-span-1"
                    classNames={{
                      mainWrapper: "flex-1",
                      label: "pl-0 lg:hidden",
                    }}
                    size="sm"
                    labelPlacement="outside-left"
                    label={<FormattedMessage {...messages.loginLabel} />}
                  />
                </FormField>
                <FormField form={form} name={`members.${index}.password`}>
                  <Input
                    className="col-span-2 lg:col-span-1"
                    classNames={{
                      mainWrapper: "flex-1",
                      label: "pl-0 lg:hidden",
                    }}
                    size="sm"
                    placeholder={
                      !!form.watch(`members.${index}._id`) ? "••••••••" : ""
                    }
                    labelPlacement="outside-left"
                    label={<FormattedMessage {...messages.passwordLabel} />}
                  />
                </FormField>
              </React.Fragment>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              color="primary"
              variant="bordered"
              startContent={<PlusIcon className="w-5 h-5" />}
              onPress={() => append({} as any)}
              data-testid="add-member"
            >
              <FormattedMessage {...messages.newMemberLabel} />
            </Button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-testid="empty"
        >
          <h4 className="text-lg font-semibold text-foreground/80 mb-2">
            <FormattedMessage {...messages.emptyStateTitle} />
          </h4>
          <p className="text-sm text-foreground/60 mb-6 max-w-md">
            <FormattedMessage {...messages.emptyStateDescription} />
          </p>
          <Button
            color="primary"
            startContent={<PlusIcon className="w-5 h-5" />}
            onPress={() => append({} as any)}
            data-testid="add-first-member"
          >
            <FormattedMessage {...messages.addFirstMemberLabel} />
          </Button>
        </div>
      )}
    </div>
  );
}
