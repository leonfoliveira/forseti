import { PlusIcon, TrashIcon, UploadIcon } from "lucide-react";
import { useRef } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { ControlledField } from "@/app/_lib/component/form/ControlledField";
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
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { MemberLoader } from "@/app/_lib/util/MemberLoader";
import { MemberType } from "@/domain/enumerate/MemberType";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";

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
        default: () => toast.error("Failed to load members from CSV."),
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
            Load CSV
            <UploadIcon />
          </AsyncButton>
        </div>
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Password</TableHead>
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
                              {EnumeratedTextUtil.getMemberType(
                                type as MemberType,
                              )}
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
                    <TooltipContent>Remove</TooltipContent>
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
          New Member
        </Button>
      </div>
    </FieldSet>
  );
}
