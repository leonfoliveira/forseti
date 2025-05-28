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
import { Badge } from "@/app/_component/badge";
import React, { Fragment } from "react";
import { Spinner } from "@/app/_component/spinner";
import { TextInput } from "@/app/_component/form/text-input";
import { ContestFormType } from "@/app/root/contests/_form/contest-form-type";
import { DateInput } from "@/app/_component/form/date-input";
import { NumberInput } from "@/app/_component/form/number-input";

import { Form } from "@/app/_component/form/form";
import { FileInput } from "@/app/_component/form/file-input";
import { useRouter } from "next/navigation";
import { DialogModal } from "@/app/_component/dialog-modal";
import { useModal } from "@/app/_util/modal-hook";
import { useDeleteContestAction } from "@/app/_action/delete-contest-action";
import { cls } from "@/app/_util/cls";

type Props = {
  contestId?: number;
  header: string;
  status?: ContestStatus;
  onSubmit: (data: ContestFormType) => Promise<void>;
  form: UseFormReturn<ContestFormType>;
  isDisabled: boolean;
  isLoading?: boolean;
};

export function ContestForm(props: Props) {
  const { contestId, header, onSubmit, form, isDisabled, status, isLoading } =
    props;
  const deleteContestAction = useDeleteContestAction();
  const router = useRouter();
  const modal = useModal();

  const membersFields = useFieldArray({
    control: form.control,
    name: "members",
  });
  const problemsFields = useFieldArray({
    control: form.control,
    name: "problems",
  });

  function getBadgeClassname() {
    return {
      [ContestStatus.NOT_STARTED]: "badge-info",
      [ContestStatus.IN_PROGRESS]: "badge-success",
      [ContestStatus.ENDED]: "badge-secondary",
    }[status || ContestStatus.NOT_STARTED];
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
              <Badge className={cls("ml-5", getBadgeClassname())}>
                {formatStatus(status)}
              </Badge>
            )}
          </div>
          <div>
            {!!isLoading && <Spinner className="mr-5" />}
            {contestId && (
              <Button className="btn-error mr-3" onClick={modal.open}>
                Delete
              </Button>
            )}
            <Button type="submit" className="btn-primary">
              Save
            </Button>
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
                  className="btn-error btn-outline mt-[39]"
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
                  className="btn-error btn-outline mt-[39]"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Fragment>
            ))}
          </div>
          <Button
            onClick={() => problemsFields.append({ timeLimit: 1000 })}
            className="mt-2"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      </div>

      <DialogModal
        modal={modal}
        onConfirm={async () =>
          deleteContestAction.act(form.watch("id") as number)
        }
        isLoading={deleteContestAction.isLoading}
      >
        <p className="py-4">Are you sure?</p>
      </DialogModal>
    </Form>
  );
}
