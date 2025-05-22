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
import React, { Fragment, useState } from "react";
import { Spinner } from "@/app/_component/spinner";
import { TextInput } from "@/app/_component/form/text-input";
import { ContestFormType } from "@/app/root/contests/_form/contest-form-type";
import { DateInput } from "@/app/_component/form/date-input";
import { NumberInput } from "@/app/_component/form/number-input";
import { FileInput } from "@/app/_component/form/file-input";
import { ReadOnlyInput } from "@/app/_component/form/read-only-input";
import { TextArea } from "@/app/_component/form/text-area";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import remarkBreaks from "remark-breaks";
import { DownloadAttachmentResponseDTO } from "@/core/repository/dto/response/DownloadAttachmentResponseDTO";

type Props = {
  header: string;
  status?: ContestStatus;
  onBack: () => void;
  onSubmit: (data: ContestFormType) => Promise<void>;
  onDownload: (attachment: DownloadAttachmentResponseDTO) => void;
  form: UseFormReturn<ContestFormType>;
  isDisabled: boolean;
  isLoading?: boolean;
};

export function ContestForm(props: Props) {
  const {
    header,
    onBack,
    onSubmit,
    onDownload,
    form,
    isDisabled,
    status,
    isLoading,
  } = props;
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

  const [openDescription, setOpenDescription] = useState<number | undefined>();

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
            onClick={() =>
              membersFields.append({ type: MemberType.CONTESTANT })
            }
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
                <ReadOnlyInput
                  label="Description"
                  value={
                    !!form.watch(`problems.${index}.description`) ? "....." : ""
                  }
                  error={errors.problems?.[index]?.description?.message}
                  onClick={() => setOpenDescription(index)}
                  readOnly
                  className="text-center tracking-wider"
                />
                <NumberInput
                  fm={form}
                  name={`problems.${index}.timeLimit`}
                  label="Time Limit"
                  step={500}
                  disabled={isDisabled}
                />
                {!!form.watch(`problems.${index}._testCases`) &&
                !form.watch(`problems.${index}.forceSelect`) ? (
                  <div className="mt-[1.2em] flex justify-center">
                    <Button
                      disabled={isDisabled}
                      className="rounded-r-none flex-1"
                      onClick={() =>
                        onDownload(
                          field._testCases as DownloadAttachmentResponseDTO,
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </Button>
                    <Button
                      disabled={isDisabled}
                      onClick={() =>
                        form.setValue(`problems.${index}.forceSelect`, true)
                      }
                      variant="warning"
                      className="rounded-l-none flex-1"
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
                    onClean={() => {
                      form.setValue(`problems.${index}.forceSelect`, false);
                      form.setValue(`problems.${index}.testCases`, undefined);
                    }}
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
            onClick={() => problemsFields.append({ timeLimit: 1000 })}
            disabled={isDisabled}
            variant="outline-primary"
            className="mt-2"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      </div>

      {openDescription != undefined && (
        <div className="fixed inset-0 top-0 left-0 w-dvw h-dvh z-10">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative h-full w-full flex flex-col bg-white m-auto p-4 rounded shadow-lg">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold m-0">Description</p>
              <Button onClick={() => setOpenDescription(undefined)}>
                Save
              </Button>
            </div>
            <div className="flex-1 gap-4 grid grid-cols-2 mt-3">
              <div className="self-stretch flex flex-col">
                <TextArea
                  fm={form}
                  name={`problems.${openDescription}.description`}
                  className="resize-none flex-1"
                  placeholder={`Enter your text here. You can use Markdown for formatting (e.g., **bold**, *italics*, \`code\`).
                  
For LaTeX, enclose your mathematical expressions with '$' for inline (e.g., $E=mc^2$) or '$$' for block equations:
$$ \\int_0^\\infty e^{-x^2} dx = \\frac{\sqrt{\\pi}}{2} $$
                  `}
                />
              </div>
              <div className="self-stretch flex flex-col">
                <div className="flex-1">
                  <div className="prose prose-neutral max-w-none">
                    <Markdown
                      remarkPlugins={[remarkMath, remarkBreaks]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {form.watch(`problems.${openDescription}.description`)}
                    </Markdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
