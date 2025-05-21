import { Input } from "@/app/_component/form/input";
import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { Checkbox } from "@/app/_component/form/checkbox";
import { Language } from "@/core/domain/enumerate/Language";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faDownload,
  faEdit,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "@/app/_component/form/select";
import { SelectOption } from "@/app/_component/form/select-option";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { z } from "zod";
import { contestFormValidation } from "@/app/root/contests/_util/contest-form-validation";
import {
  ContestStatus,
  formatLanguage,
  formatStatus,
} from "@/app/_util/contest-utils";
import { Badge, BadgeVariant } from "@/app/_component/badge";
import React, { Fragment } from "react";
import { Spinner } from "@/app/_component/spinner";

export type ContestFormType = z.infer<typeof contestFormValidation>;

type Props = {
  header: string;
  status?: ContestStatus;
  onBack: () => void;
  onSubmit: (data: ContestFormType) => Promise<void>;
  form: UseFormReturn<ContestFormType>;
  isDisabled: boolean;
  isLoading?: boolean;
};

export function ContestForm(props: Props) {
  const { header, onBack, onSubmit, form, isDisabled, status, isLoading } =
    props;
  const {
    formState: { errors },
  } = form;

  const membersFields = useFieldArray({
    control: form.control,
    name: "members",
  });
  const problemsFields = useFieldArray({
    control: form.control,
    name: "problems",
  });

  function getBadgeVariant() {
    return {
      [ContestStatus.NOT_STARTED]: "primary",
      [ContestStatus.IN_PROGRESS]: "success",
      [ContestStatus.ENDED]: "danger",
    }[status || ContestStatus.NOT_STARTED] as BadgeVariant;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col justify-start">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={onBack}
              className="cursor-pointer text-2xl"
            />
            <h1 className="text-2xl ml-5">{header}</h1>
            {status && (
              <Badge variant={getBadgeVariant()} className="ml-5">
                {formatStatus(status)}
              </Badge>
            )}
          </div>
          <div>
            {!!isLoading && <Spinner className="mr-5" />}
            <Button type="submit" disabled={isDisabled}>
              Save
            </Button>
          </div>
        </div>
        <Input
          label="Title"
          disabled={isDisabled}
          {...form.register("title")}
          error={errors.title?.message}
        />
        <Controller
          name="languages"
          control={form.control}
          render={({ field }) => {
            const { value, onChange } = field;

            return (
              <CheckboxGroup
                label="Languages"
                error={errors.languages?.message}
              >
                {Object.values(Language).map((language) => (
                  <Checkbox
                    key={language}
                    value={language}
                    disabled={isDisabled}
                    checked={(value || []).includes(language)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      if (checked) {
                        onChange([...value, language]);
                      } else {
                        onChange(value.filter((l) => l !== language));
                      }
                    }}
                  >
                    {formatLanguage(language)}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            );
          }}
        />
        <div className="flex gap-x-3">
          <Input
            label="Start At"
            type="datetime-local"
            disabled={isDisabled}
            {...form.register("startAt", { valueAsDate: true })}
            error={errors.startAt?.message}
            containerClassName="flex-1"
          />
          <Input
            label="End At"
            type="datetime-local"
            disabled={isDisabled}
            {...form.register("endAt", { valueAsDate: true })}
            error={errors.endAt?.message}
            containerClassName="flex-1"
          />
        </div>
      </div>
      <div className="mt-5">
        <p className="block text-md font-semibold mb-2">Members</p>
        <div className="grid [grid-template-columns:1fr_2fr_1fr_1fr_auto] items-start gap-x-3">
          {membersFields.fields.map((field, index) => (
            <Fragment key={field.id}>
              <Select
                label="Type"
                {...form.register(`members.${index}.type`)}
                error={errors.members?.[index]?.type?.toString()}
              >
                {Object.values(MemberType)
                  .filter((it) => it !== MemberType.ROOT)
                  .map((type) => (
                    <SelectOption key={type} value={type}>
                      {type}
                    </SelectOption>
                  ))}
              </Select>
              <Input
                label="Name"
                disabled={isDisabled}
                {...form.register(`members.${index}.name`)}
                error={errors.members?.[index]?.name?.message}
              />
              <Input
                label="Login"
                disabled={isDisabled}
                {...form.register(`members.${index}.login`)}
                error={errors.members?.[index]?.login?.message}
              />
              <Input
                label="Password"
                placeholder={!!field._id ? "******" : ""}
                disabled={isDisabled}
                {...form.register(`members.${index}.password`)}
                error={errors.members?.[index]?.password?.message}
              />
              <Button
                onClick={() => membersFields.remove(index)}
                disabled={isDisabled}
                variant="outline-danger"
                className="mt-[1.1em]"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </Fragment>
          ))}
        </div>
        <Button
          onClick={() => membersFields.append({} as ContestFormType["members"])}
          disabled={isDisabled}
          variant="outline-primary"
          className="mt-2"
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
      <div className="mt-5">
        <p className="block text-md font-semibold mb-2">Problems</p>
        <div className="grid [grid-template-columns:2fr_1fr_1fr_auto] items-start gap-x-3">
          {problemsFields.fields.map((field, index) => (
            <Fragment key={field.id}>
              <Input
                label="Title"
                disabled={isDisabled}
                {...form.register(`problems.${index}.title`)}
                error={errors.problems?.[index]?.title?.message}
              />
              <Input
                type="number"
                label="Time Limit"
                disabled={isDisabled}
                {...form.register(`problems.${index}.timeLimit`, {
                  valueAsNumber: true,
                })}
                error={errors.problems?.[index]?.timeLimit?.message}
              />
              {!!field.testCasesAttachment ? (
                <div>
                  <Button disabled={isDisabled}>
                    <FontAwesomeIcon icon={faDownload} />
                  </Button>
                  <Button
                    disabled={isDisabled}
                    onClick={() =>
                      form.setValue(
                        `problems.${index}.testCasesAttachment`,
                        undefined,
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                </div>
              ) : (
                <Input
                  label="Test Cases"
                  type="file"
                  disabled={isDisabled}
                  {...form.register(`problems.${index}.testCases`)}
                  error={errors.problems?.[index]?.testCases?.message as string}
                />
              )}
              <Button
                onClick={() => problemsFields.remove(index)}
                disabled={isDisabled}
                variant="outline-danger"
                className="mt-[1.1em]"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </Fragment>
          ))}
        </div>
        <Button
          onClick={() =>
            problemsFields.append({} as ContestFormType["problems"])
          }
          disabled={isDisabled}
          variant="outline-primary"
          className="mt-2"
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
    </form>
  );
}
