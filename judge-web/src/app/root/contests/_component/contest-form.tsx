import { Input } from "@/app/_component/form/input";
import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { Checkbox } from "@/app/_component/form/checkbox";
import { Language } from "@/core/domain/enumerate/Language";
import { useFieldArray, UseFormReturn } from "react-hook-form";
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
import { DownloadAttachmentResponseDTO } from "@/core/repository/dto/response/DownloadAttachmentResponseDTO";

export type ContestFormType = {
  id?: number;
  title: string;
  languages: Language[];
  startAt: Date;
  endAt: Date;
  members: {
    _id?: number;
    type: MemberType;
    name: string;
    login: string;
    password?: string;
  }[];
  problems: {
    _id?: number;
    title: string;
    description: string;
    timeLimit: number;
    testCasesAttachment?: DownloadAttachmentResponseDTO;
    testCases?: File[];
  }[];
};

type Props = {
  onSubmit: (data: ContestFormType) => Promise<void>;
  form: UseFormReturn<ContestFormType>;
  isDisabled: boolean;
};

export function ContestForm(props: Props) {
  const { onSubmit, form, isDisabled } = props;

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
      <Input label="Title" disabled={isDisabled} {...form.register("title")} />
      <CheckboxGroup label="Languages">
        {Object.values(Language).map((language) => (
          <Checkbox key={language} value={language} disabled={isDisabled}>
            {language}
          </Checkbox>
        ))}
      </CheckboxGroup>
      <Input
        label="Start At"
        type="datetime-local"
        disabled={isDisabled}
        {...form.register("startAt")}
      />
      <Input
        label="End At"
        type="datetime-local"
        disabled={isDisabled}
        {...form.register("endAt")}
      />
      <div>
        <p>Members</p>
        {membersFields.fields.map((field, index) => (
          <div key={field.id}>
            <Select {...form.register(`members.${index}.type`)}>
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
            />
            <Input
              label="Login"
              disabled={isDisabled}
              {...form.register(`members.${index}.login`)}
            />
            <Input
              label="Password"
              placeholder={field._id !== null ? "*****" : ""}
              disabled={isDisabled}
              {...form.register(`members.${index}.password`)}
            />
            <Button onClick={() => membersFields.remove(index)}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        ))}
        <Button
          onClick={() => membersFields.append({} as ContestFormType["members"])}
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
            />
            <Input
              label="Description"
              disabled={isDisabled}
              {...form.register(`problems.${index}.description`)}
            />
            {field.testCasesAttachment !== null ? (
              <div>
                <Button>
                  <FontAwesomeIcon icon={faDownload} />
                </Button>
                <Button
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
                label="Time Limit"
                type="file"
                disabled={isDisabled}
                {...form.register(`problems.${index}.testCases`)}
              />
            )}
            <Button onClick={() => problemsFields.remove(index)}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        ))}
        <Button
          onClick={() =>
            problemsFields.append({} as ContestFormType["problems"])
          }
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
    </form>
  );
}
