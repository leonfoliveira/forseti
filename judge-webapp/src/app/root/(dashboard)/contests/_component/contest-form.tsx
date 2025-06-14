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
import React, { Fragment } from "react";
import { Spinner } from "@/app/_component/spinner";
import { TextInput } from "@/app/_component/form/text-input";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form-type";
import { DateInput } from "@/app/_component/form/date-input";
import { NumberInput } from "@/app/_component/form/number-input";

import { Form } from "@/app/_component/form/form";
import { FileInput } from "@/app/_component/form/file-input";
import { redirect, useRouter } from "next/navigation";
import { DialogModal } from "@/app/_component/dialog-modal";
import { useModal } from "@/app/_util/modal-hook";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestStatusBadge } from "@/app/root/(dashboard)/contests/_component/contest-status-badge";
import { LoadableState, useLoadableState } from "@/app/_util/loadable-state";
import { contestService } from "@/app/_composition";
import { handleError } from "@/app/_util/error-handler";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { routes } from "@/app/_routes";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useAlert } from "@/app/_component/context/notification-context";

type Props = {
  contestId?: string;
  header: string;
  contest?: WithStatus<ContestFullResponseDTO>;
  onSubmit: (data: ContestFormType) => Promise<void>;
  form: UseFormReturn<ContestFormType>;
  isDisabled: boolean;
  isLoading?: boolean;
  saveState: LoadableState<WithStatus<ContestFullResponseDTO>>;
};

export function ContestForm(props: Props) {
  const {
    contestId,
    header,
    contest,
    onSubmit,
    form,
    isDisabled,
    isLoading,
    saveState,
  } = props;
  const deleteContestState = useLoadableState();

  const router = useRouter();
  const deleteModal = useModal();
  const alert = useAlert();
  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("root.contests._component.contest-form");
  const s = useTranslations("root.contests._form.contest-form-schema");

  async function onDelete() {
    deleteContestState.start();
    try {
      await contestService.deleteContest(contest!.id);
      deleteContestState.finish();
      deleteModal.close();
      alert.success(t("delete-success"));
    } catch (error) {
      deleteContestState.fail(error);
      handleError(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN),
        [ForbiddenException.name]: () => redirect(routes.FORBIDDEN),
        default: () => alert.error(t("delete-error")),
      });
    }
  }

  const membersFields = useFieldArray({
    control: form.control,
    name: "members",
  });
  const problemsFields = useFieldArray({
    control: form.control,
    name: "problems",
  });

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} disabled={isDisabled}>
      <div className="flex flex-col justify-start">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={() => router.push("/root/contests")}
              className="cursor-pointer text-2xl"
              data-testid="back"
            />
            <h1 className="text-2xl ml-5" data-testid="header">
              {header}
            </h1>
            {contest && (
              <ContestStatusBadge
                contest={contest}
                className="ml-5"
                data-testid="badge"
              />
            )}
          </div>
          <div>
            {!!isLoading && <Spinner className="mr-5" />}
            {contestId && (
              <Button
                className="btn-error mr-3"
                onClick={deleteModal.open}
                data-testid="delete"
              >
                {t("delete:label")}
              </Button>
            )}
            <Button
              type="submit"
              isLoading={saveState.isLoading}
              className="btn-primary"
              data-testid="save"
            >
              {t("save:label")}
            </Button>
          </div>
        </div>
        <div className="flex gap-x-3">
          <TextInput
            fm={form}
            name="slug"
            s={s}
            label={t("slug:label")}
            data-testid="slug"
          />
          <TextInput
            fm={form}
            name="title"
            s={s}
            label={t("title:label")}
            data-testid="title"
            containerClassName="flex-1"
          />
        </div>
        <CheckboxGroup
          fm={form}
          options={Object.values(Language).map((it) => ({
            value: it,
            label: formatLanguage(it),
          }))}
          name="languages"
          s={s}
          label={t("languages:label")}
          containerClassName="mt-5"
          data-testid="languages"
        />
        <div className="flex gap-x-3">
          <DateInput
            fm={form}
            name="startAt"
            s={s}
            label={t("start-at:label")}
            containerClassName="flex-1"
            data-testid="start-at"
          />
          <DateInput
            fm={form}
            name="endAt"
            s={s}
            label={t("end-at:label")}
            containerClassName="flex-1"
            data-testid="end-at"
          />
        </div>
      </div>
      <div className="grid gap-x-15 gap-y-5 2xl:[grid-template-columns:1fr_auto_1fr]">
        <div className="mt-5">
          <div className="divider">
            <p className="block text-md font-semibold mb-2">
              {t("members-header")}
            </p>
          </div>
          <div className="grid [grid-template-columns:1fr_2fr_1fr_1fr_auto] items-start gap-x-3">
            {membersFields.fields.map((field, index) => (
              <Fragment key={field.id}>
                <Select
                  fm={form}
                  name={`members.${index}.type`}
                  s={s}
                  label={t("member-type:label")}
                  options={Object.values(MemberType)
                    .filter((it) => it !== MemberType.ROOT)
                    .map((it) => ({
                      value: it,
                      label: it,
                    }))}
                  data-testid="member-type"
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.name`}
                  s={s}
                  label={t("member-name:label")}
                  data-testid="member-name"
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.login`}
                  s={s}
                  label={t("member-login:label")}
                  data-testid="member-login"
                />
                <TextInput
                  fm={form}
                  name={`members.${index}.password`}
                  s={s}
                  label={t("member-password:label")}
                  placeholder={!!field._id ? "Not changed" : ""}
                  data-testid="member-password"
                />
                <Button
                  onClick={() => membersFields.remove(index)}
                  className="btn-error btn-outline mt-[39]"
                  data-testid="member-delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Fragment>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() =>
                membersFields.append({ type: MemberType.CONTESTANT })
              }
              className="mt-5 px-10"
              data-testid="member-add"
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </div>
        </div>
        <div className="hidden 2xl:flex divider divider-horizontal mt-10" />
        <div className="mt-5">
          <div className="divider">
            <p className="block text-md font-semibold mb-2">
              {t("problems-header")}
            </p>
          </div>
          <div className="grid [grid-template-columns:35px_2fr_1fr_1fr_1fr_auto] items-start gap-x-3">
            {problemsFields.fields.map((field, index) => (
              <Fragment key={field.id}>
                <TextInput
                  fm={form}
                  s={s}
                  name={`problems.${index}.letter`}
                  value={String.fromCodePoint(65 + index).toString()}
                  label={t("problem-letter:label")}
                  data-testid="problem-letter"
                  disabled={true}
                />
                <TextInput
                  fm={form}
                  s={s}
                  name={`problems.${index}.title`}
                  label={t("problem-title:label")}
                  data-testid="problem-title"
                />
                <FileInput
                  fm={form}
                  s={s}
                  originalName={`problems.${index}.description`}
                  name={`problems.${index}.newDescription`}
                  label={t("problem-description:label")}
                  data-testid="problem-description"
                />
                <NumberInput
                  fm={form}
                  s={s}
                  name={`problems.${index}.timeLimit`}
                  label={t("problem-time-limit:label")}
                  step={500}
                  data-testid="problem-time-limit"
                />
                <FileInput
                  fm={form}
                  s={s}
                  originalName={`problems.${index}.testCases`}
                  name={`problems.${index}.newTestCases`}
                  label={t("problem-test-cases:label")}
                  data-testid="problem-test-cases"
                />
                <Button
                  onClick={() => problemsFields.remove(index)}
                  className="btn-error btn-outline mt-[39]"
                  data-testid="problem-delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Fragment>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => problemsFields.append({ timeLimit: 1000 })}
              className="mt-5 px-10"
              data-testid="problem-add"
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </div>
        </div>
      </div>

      <DialogModal
        modal={deleteModal}
        onConfirm={() => onDelete()}
        isLoading={deleteContestState.isLoading}
        data-testid="delete-modal"
      >
        <p className="py-4">{t("confirm-content")}</p>
      </DialogModal>
    </Form>
  );
}
