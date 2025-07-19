import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { Language } from "@/core/domain/enumerate/Language";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronLeft,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "@/app/_component/form/select";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import React, { Fragment, useEffect } from "react";
import { TextInput } from "@/app/_component/form/text-input";
import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form-type";
import { DateTimeInput } from "@/app/_component/form/date-time-input";
import { NumberInput } from "@/app/_component/form/number-input";

import { Form } from "@/app/_component/form/form";
import { FileInput } from "@/app/_component/form/file-input";
import { redirect, useRouter } from "next/navigation";
import { DialogModal } from "@/app/_component/dialog-modal";
import { useModal } from "@/app/_util/modal-hook";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestStatusBadge } from "@/app/root/(dashboard)/contests/_component/contest-status-badge";
import { LoadableState, useLoadableState } from "@/app/_util/loadable-state";
import { contestService } from "@/composition";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { routes } from "@/routes";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useAlert } from "@/app/_component/context/notification-context";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useContestStatusWatcher } from "@/app/_util/contest-status-watcher";

type Props = {
  contestState?: LoadableState<ContestFullResponseDTO>;
  saveState: LoadableState<ContestFullResponseDTO>;
  onSubmit: (data: ContestFormType) => Promise<void>;
  form: UseFormReturn<ContestFormType>;
};

/**
 * ContestForm component is used to create or edit a contest.
 */
export function ContestForm(props: Props) {
  const { contestState, saveState, onSubmit, form } = props;
  const deleteContestState = useLoadableState();
  const status = useContestStatusWatcher(contestState?.data);

  const router = useRouter();
  const deleteModal = useModal();
  const saveModal = useModal<ContestFormType>();
  const alert = useAlert();
  const { formatLanguage } = useContestFormatter();
  const t = useTranslations("root.contests._component.contest-form");
  const s = useTranslations("root.contests._form.contest-form");

  useEffect(() => {
    if (status && status === ContestStatus.IN_PROGRESS) {
      alert.warning(t("in-progress"));
    }
  }, [status]);

  async function onDelete() {
    deleteContestState.start();
    try {
      await contestService.deleteContest(contestState!.data!.id);
      deleteContestState.finish();
      deleteModal.close();
      alert.success(t("delete-success"));
    } catch (error) {
      deleteContestState.fail(error, {
        [UnauthorizedException.name]: () => redirect(routes.ROOT_SIGN_IN()),
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
    <Form
      onSubmit={form.handleSubmit(saveModal.open)}
      disabled={
        contestState?.isLoading ||
        saveState.isLoading ||
        status === ContestStatus.ENDED
      }
    >
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
              {contestState?.data
                ? t("edit-header", { id: contestState.data.id })
                : t("create-header")}
            </h1>
            {contestState?.data && (
              <ContestStatusBadge
                contest={contestState.data}
                className="ml-5"
                data-testid="badge"
              />
            )}
          </div>
          <div className="flex gap-x-2">
            {contestState?.data && (
              <Button
                className="btn-error btn-soft mr-3"
                isLoading={deleteContestState.isLoading}
                onClick={deleteModal.open}
                disabled={status !== ContestStatus.NOT_STARTED}
                data-testid="delete"
              >
                <FontAwesomeIcon icon={faTrash} />
                {t("delete:label")}
              </Button>
            )}
            <Button
              type="submit"
              isLoading={saveState.isLoading}
              className="btn-primary"
              data-testid="save"
            >
              <FontAwesomeIcon icon={faCheck} />
              {t("save:label")}
            </Button>
          </div>
        </div>
        <div className="flex gap-x-3">
          <TextInput
            form={form}
            name="slug"
            s={s}
            label={t("slug:label")}
            data-testid="slug"
          />
          <TextInput
            form={form}
            name="title"
            s={s}
            label={t("title:label")}
            data-testid="title"
            containerClassName="flex-1"
          />
        </div>
        <CheckboxGroup
          form={form}
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
          <DateTimeInput
            form={form}
            name="startAt"
            s={s}
            label={t("start-at:label")}
            containerClassName="flex-1"
            data-testid="start-at"
            disabled={!!status && status !== ContestStatus.NOT_STARTED}
          />
          <DateTimeInput
            form={form}
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
                  form={form}
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
                  form={form}
                  name={`members.${index}.name`}
                  s={s}
                  label={t("member-name:label")}
                  data-testid="member-name"
                />
                <TextInput
                  form={form}
                  name={`members.${index}.login`}
                  s={s}
                  label={t("member-login:label")}
                  data-testid="member-login"
                />
                <TextInput
                  form={form}
                  name={`members.${index}.password`}
                  s={s}
                  label={t("member-password:label")}
                  placeholder={!!field._id ? "Not changed" : ""}
                  data-testid="member-password"
                />
                <Button
                  onClick={() => membersFields.remove(index)}
                  className="btn-error btn-soft mt-[39]"
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
          <div className="grid [grid-template-columns:35px_repeat(3,1fr)_auto] items-start gap-x-3">
            {problemsFields.fields.map((field, index) => (
              <Fragment key={field.id}>
                <TextInput
                  form={form}
                  s={s}
                  name={`problems.${index}.letter`}
                  value={String.fromCodePoint(65 + index).toString()}
                  label={t("problem-letter:label")}
                  data-testid="problem-letter"
                  disabled={true}
                />
                <TextInput
                  form={form}
                  s={s}
                  name={`problems.${index}.title`}
                  label={t("problem-title:label")}
                  data-testid="problem-title"
                  containerClassName="col-span-2"
                />
                <FileInput
                  form={form}
                  s={s}
                  originalName={`problems.${index}.description`}
                  name={`problems.${index}.newDescription`}
                  label={t("problem-description:label")}
                  data-testid="problem-description"
                />
                <Button
                  onClick={() => problemsFields.remove(index)}
                  className="btn-error btn-soft mt-[39]"
                  data-testid="problem-delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
                <span />
                <NumberInput
                  form={form}
                  s={s}
                  name={`problems.${index}.timeLimit`}
                  label={t("problem-time-limit:label")}
                  step={500}
                  data-testid="problem-time-limit"
                />
                <NumberInput
                  form={form}
                  s={s}
                  name={`problems.${index}.memoryLimit`}
                  label={t("problem-memory-limit:label")}
                  step={512}
                  data-testid="problem-memory-limit"
                />
                <FileInput
                  form={form}
                  s={s}
                  originalName={`problems.${index}.testCases`}
                  name={`problems.${index}.newTestCases`}
                  label={t("problem-test-cases:label")}
                  data-testid="problem-test-cases"
                />
                <span />
              </Fragment>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() =>
                problemsFields.append({ timeLimit: 1000, memoryLimit: 2048 })
              }
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
        <p className="py-4">{t("confirm-delete-content")}</p>
      </DialogModal>

      <DialogModal
        modal={saveModal}
        onConfirm={onSubmit}
        isLoading={saveState.isLoading}
        data-testid="save-modal"
      >
        <p className="py-4">{t("confirm-save-content")}</p>
      </DialogModal>
    </Form>
  );
}
