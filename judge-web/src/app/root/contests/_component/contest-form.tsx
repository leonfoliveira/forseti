import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { Language } from "@/core/domain/enumerate/Language";
import { useFieldArray, UseFormReturn } from "react-hook-form";
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
import { MemberType } from "@/core/domain/enumerate/MemberType";
import {
  ContestStatus,
  formatLanguage,
  formatStatus,
} from "@/app/_util/contest-utils";
import { Badge, BadgeVariant } from "@/app/_component/badge";
import React, { Fragment } from "react";
import { Spinner } from "@/app/_component/spinner";
import { TextInput } from "@/app/_component/form/text-input";
import { ContestFormType } from "@/app/root/contests/_form/contest-form-type";
import { DateInput } from "@/app/_component/form/date-input";
import { NumberInput } from "@/app/_component/form/number-input";
import { FileInput } from "@/app/_component/form/file-input";

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
        <TextInput fm={form} name="title" label="Title" disabled={isDisabled} />
        <CheckboxGroup
          fm={form}
          options={Object.values(Language).map((it) => ({
            value: it,
            label: formatLanguage(it),
          }))}
          disabled={isDisabled}
          name="languages"
          label="Languages"
          containerClassName="mt-5"
        />
        <div className="flex gap-x-3">
          <DateInput
            fm={form}
            name="startAt"
            label="Start At"
            disabled={isDisabled}
            containerClassName="flex-1"
          />
          <DateInput
            fm={form}
            name="endAt"
            label="End At"
            disabled={isDisabled}
            containerClassName="flex-1"
          />
        </div>
      </div>
      <div className="flex flex-col gap-5 xl:flex-row">
        <div className="mt-5">
          <p className="block text-md font-semibold mb-2">Members</p>
          <div className="grid [grid-template-columns:1fr_2fr_1fr_1fr_auto] items-start gap-x-3">
            {membersFields.fields.map((field, index) => (
              <Fragment key={field.id}>
                <Select
                  fm={form}
                  name={`members.${index}.type`}
                  label="Type"
                  options={Object.values(MemberType)
                    .filter((it) => it !== MemberType.ROOT)
                    .map((it) => ({
                      value: it,
                      label: it,
                    }))}
                  disabled={isDisabled}
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.name`}
                  label="Name"
                  disabled={isDisabled}
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.login`}
                  label="Login"
                  disabled={isDisabled}
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.password`}
                  label="Password"
                  placeholder={!!field._id ? "Not changed" : ""}
                  disabled={isDisabled}
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
            onClick={() => membersFields.append({})}
            disabled={isDisabled}
            variant="outline-primary"
            className="mt-2"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
        <div className="mt-5">
          <p className="block text-md font-semibold mb-2">Problems</p>
          <div className="grid [grid-template-columns:2fr_1fr_1fr_1fr_auto] items-start gap-x-3">
            {problemsFields.fields.map((field, index) => (
              <Fragment key={field.id}>
                <TextInput
                  fm={form}
                  name={`problems.${index}.title`}
                  label="Title"
                  disabled={isDisabled}
                />
                <TextInput
                  fm={form}
                  name={`problems.${index}.description`}
                  label="Description"
                  disabled={isDisabled}
                />
                <NumberInput
                  fm={form}
                  name={`problems.${index}.timeLimit`}
                  label="Time Limit"
                  step={500}
                  disabled={isDisabled}
                />
                {!!field._testCases ? (
                  <div className="mt-[1.2em] flex justify-center">
                    <Button disabled={isDisabled} className="rounded-r-none">
                      <FontAwesomeIcon icon={faDownload} />
                    </Button>
                    <Button
                      disabled={isDisabled}
                      onClick={() =>
                        form.setValue(`problems.${index}._testCases`, undefined)
                      }
                      variant="warning"
                      className="rounded-l-none"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                  </div>
                ) : (
                  <FileInput
                    fm={form}
                    name={`problems.${index}.testCases`}
                    label="Test Cases"
                    disabled={isDisabled}
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
            onClick={() => problemsFields.append({})}
            disabled={isDisabled}
            variant="outline-primary"
            className="mt-2"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      </div>
    </form>
  );
}
