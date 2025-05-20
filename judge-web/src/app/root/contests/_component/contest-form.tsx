import { Input } from "@/app/_component/form/input";
import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { Checkbox } from "@/app/_component/form/checkbox";
import { Language } from "@/core/domain/enumerate/Language";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import { ContestStatus } from "@/app/_util/contest-utils";

export type ContestFormType = z.infer<typeof contestFormValidation>;

type Props = {
  header: string;
  status?: ContestStatus;
  onSubmit: (data: ContestFormType) => Promise<void>;
  form: UseFormReturn<ContestFormType>;
  isDisabled: boolean;
};

export function ContestForm(props: Props) {
  const { header, onSubmit, form, isDisabled, status } = props;
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <h1>{header}</h1>
      <span>{status}</span>
      <button>Save</button>
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
            <CheckboxGroup label="Languages" error={errors.languages?.message}>
              {Object.values(Language).map((language) => (
                <Checkbox
                  key={language}
                  value={language}
                  disabled={isDisabled}
                  checked={value.includes(language)}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    if (checked) {
                      onChange([...value, language]);
                    } else {
                      onChange(value.filter((l) => l !== language));
                    }
                  }}
                >
                  {language}
                </Checkbox>
              ))}
            </CheckboxGroup>
          );
        }}
      />
      <Input
        label="Start At"
        type="datetime-local"
        disabled={isDisabled}
        {...form.register("startAt", { valueAsDate: true })}
        error={errors.startAt?.message}
      />
      <Input
        label="End At"
        type="datetime-local"
        disabled={isDisabled}
        {...form.register("endAt", { valueAsDate: true })}
        error={errors.endAt?.message}
      />
      <div>
        <p>Members</p>
        {membersFields.fields.map((field, index) => (
          <div key={field.id}>
            <Select
              {...form.register(`members.${index}.type`)}
              error={errors.members?.[index]?.type?.toString()}
            >
              {Object.values(MemberType).map((type) => (
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
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        ))}
        <Button
          onClick={() => membersFields.append({} as ContestFormType["members"])}
          disabled={isDisabled}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
      <div>
        <p>Problems</p>
        {problemsFields.fields.map((field, index) => (
          <div key={field.id}>
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
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        ))}
        <Button
          onClick={() =>
            problemsFields.append({} as ContestFormType["problems"])
          }
          disabled={isDisabled}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
    </form>
  );
}
