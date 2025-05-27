import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { Language } from "@/core/domain/enumerate/Language";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
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

import { Form } from "@/app/_component/form/form";
import { FileInput } from "@/app/_component/form/file-input";
import { useRouter } from "next/navigation";

type Props = {
  header: string;
  status?: ContestStatus;
  onSubmit: (data: ContestFormType) => Promise<void>;
  form: UseFormReturn<ContestFormType>;
  isDisabled: boolean;
  isLoading?: boolean;
};

export function ContestForm(props: Props) {
  const { header, onSubmit, form, isDisabled, status, isLoading } = props;
  const router = useRouter();

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
    <Form onSubmit={form.handleSubmit(onSubmit)} disabled={isDisabled}>
      <div className="flex flex-col justify-start">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={() => router.push("/root/contests")}
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
            <Button type="submit">Save</Button>
          </div>
        </div>
        <TextInput fm={form} name="title" label="Title" />
        <CheckboxGroup
          fm={form}
          options={Object.values(Language).map((it) => ({
            value: it,
            label: formatLanguage(it),
          }))}
          name="languages"
          label="Languages"
          containerClassName="mt-5"
        />
        <div className="flex gap-x-3">
          <DateInput
            fm={form}
            name="startAt"
            label="Start At"
            containerClassName="flex-1"
          />
          <DateInput
            fm={form}
            name="endAt"
            label="End At"
            containerClassName="flex-1"
          />
        </div>
      </div>
      <div className="grid gap-x-15 gap-y-5 2xl:grid-cols-2">
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
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.name`}
                  label="Name"
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.login`}
                  label="Login"
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.password`}
                  label="Password"
                  placeholder={!!field._id ? "Not changed" : ""}
                />
                <Button
                  onClick={() => membersFields.remove(index)}
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
              membersFields.append({ type: MemberType.CONTESTANT })
            }
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
                />
                <FileInput
                  fm={form}
                  originalName={`problems.${index}.description`}
                  name={`problems.${index}.newDescription`}
                  label="Description"
                />
                <NumberInput
                  fm={form}
                  name={`problems.${index}.timeLimit`}
                  label="Time Limit"
                  step={500}
                />
                <FileInput
                  fm={form}
                  originalName={`problems.${index}.testCases`}
                  name={`problems.${index}.newTestCases`}
                  label="Test Cases"
                />
                <Button
                  onClick={() => problemsFields.remove(index)}
                  variant="outline-danger"
                  className="mt-[1.1em]"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Fragment>
            ))}
          </div>
          <Button
            onClick={() => problemsFields.append({ timeLimit: 1000 })}
            variant="outline-primary"
            className="mt-2"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      </div>
    </Form>
  );
}
