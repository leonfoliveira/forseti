import {
  faCheck,
  faChevronLeft,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { Fragment, useEffect } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { ContestFormType } from "@/app/root/(dashboard)/contests/_form/contest-form";
import { contestService } from "@/config/composition";
import { routes } from "@/config/routes";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { globalMessages } from "@/i18n/global";
import { ContestStatusBadge } from "@/lib/component/badge/contest-status-badge";
import { Button } from "@/lib/component/form/button";
import { CheckboxGroup } from "@/lib/component/form/checkbox-group";
import { DateTimeInput } from "@/lib/component/form/date-time-input";
import { FileInput } from "@/lib/component/form/file-input";
import { Form } from "@/lib/component/form/form";
import { NumberInput } from "@/lib/component/form/number-input";
import { Select } from "@/lib/component/form/select";
import { TextInput } from "@/lib/component/form/text-input";
import { DialogModal } from "@/lib/component/modal/dialog-modal";
import { useContestStatusWatcher } from "@/lib/util/contest-status-watcher";
import { LoadableState, useLoadableState } from "@/lib/util/loadable-state";
import { useModal } from "@/lib/util/modal-hook";
import { useAlert } from "@/store/slices/alerts-slice";

const messages = defineMessages({
  inProgress: {
    id: "app.root.(dashboard).contests._component.contest-form.in-progress",
    defaultMessage: "This contest is in progress, be careful when editing it.",
  },
  deleteSuccess: {
    id: "app.root.(dashboard).contests._component.contest-form.delete-success",
    defaultMessage: "The contest has been successfully deleted.",
  },
  deleteError: {
    id: "app.root.(dashboard).contests._component.contest-form.delete-error",
    defaultMessage: "An error occurred while deleting the contest.",
  },
  editHeader: {
    id: "app.root.(dashboard).contests._component.contest-form.edit-header",
    defaultMessage: "Contest #{id}",
  },
  createHeader: {
    id: "app.root.(dashboard).contests._component.contest-form.create-header",
    defaultMessage: "Contest New",
  },
  delete: {
    id: "app.root.(dashboard).contests._component.contest-form.delete-label",
    defaultMessage: "Delete",
  },
  save: {
    id: "app.root.(dashboard).contests._component.contest-form.save-label",
    defaultMessage: "Save",
  },
  slug: {
    id: "app.root.(dashboard).contests._component.contest-form.slug",
    defaultMessage: "Slug",
  },
  title: {
    id: "app.root.(dashboard).contests._component.contest-form.title",
    defaultMessage: "Title",
  },
  languages: {
    id: "app.root.(dashboard).contests._component.contest-form.languages",
    defaultMessage: "Languages",
  },
  startAt: {
    id: "app.root.(dashboard).contests._component.contest-form.start-at",
    defaultMessage: "Start At",
  },
  endAt: {
    id: "app.root.(dashboard).contests._component.contest-form.end-at",
    defaultMessage: "End At",
  },
  members: {
    id: "app.root.(dashboard).contests._component.contest-form.members",
    defaultMessage: "Members",
  },
  memberType: {
    id: "app.root.(dashboard).contests._component.contest-form.member-type",
    defaultMessage: "Type",
  },
  memberName: {
    id: "app.root.(dashboard).contests._component.contest-form.member-name",
    defaultMessage: "Name",
  },
  memberLogin: {
    id: "app.root.(dashboard).contests._component.contest-form.member-login",
    defaultMessage: "Login",
  },
  memberPassword: {
    id: "app.root.(dashboard).contests._component.contest-form.member-password",
    defaultMessage: "Password",
  },
  problems: {
    id: "app.root.(dashboard).contests._component.contest-form.problems",
    defaultMessage: "Problems",
  },
  problemLetter: {
    id: "app.root.(dashboard).contests._component.contest-form.problem-letter",
    defaultMessage: "Letter",
  },
  problemTitle: {
    id: "app.root.(dashboard).contests._component.contest-form.problem-title",
    defaultMessage: "Title",
  },
  problemDescription: {
    id: "app.root.(dashboard).contests._component.contest-form.problem-description",
    defaultMessage: "Description",
  },
  problemTimeLimit: {
    id: "app.root.(dashboard).contests._component.contest-form.problem-time-limit",
    defaultMessage: "Time Limit (ms)",
  },
  problemMemoryLimit: {
    id: "app.root.(dashboard).contests._component.contest-form.problem-memory-limit",
    defaultMessage: "Memory Limit (MB)",
  },
  problemTestCases: {
    id: "app.root.(dashboard).contests._component.contest-form.problem-test-cases",
    defaultMessage: "Test Cases (csv)",
  },
  addTooltip: {
    id: "app.root.(dashboard).contests._component.contest-form.add-tooltip",
    defaultMessage: "Add",
  },
  removeTooltip: {
    id: "app.root.(dashboard).contests._component.contest-form.remove-tooltip",
    defaultMessage: "Remove",
  },
  confirmDelete: {
    id: "app.root.(dashboard).contests._component.contest-form.confirm-delete",
    defaultMessage: "Are you sure you want to delete this contest?",
  },
});

type Props = {
  contestState?: LoadableState<ContestFullResponseDTO>;
  saveState: LoadableState<ContestFullResponseDTO>;
  onSubmit: (data: ContestFormType) => void;
  form: UseFormReturn<ContestFormType>;
};

/**
 * ContestForm component is used to create or edit a contest.
 */
export function ContestForm({
  contestState,
  saveState,
  onSubmit,
  form,
}: Props) {
  const deleteContestState = useLoadableState();
  const status = useContestStatusWatcher(contestState?.data);

  const router = useRouter();
  const deleteModal = useModal();
  const alert = useAlert();

  useEffect(() => {
    if (status && status === ContestStatus.IN_PROGRESS) {
      alert.warning(messages.inProgress);
    }
  }, [status]);

  async function onDelete() {
    deleteContestState.start();
    try {
      await contestService.deleteContest(contestState!.data!.id);
      deleteContestState.finish();
      deleteModal.close();
      alert.success(messages.deleteSuccess);
    } catch (error) {
      deleteContestState.fail(error, {
        default: () => alert.error(messages.deleteError),
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
      onSubmit={form.handleSubmit(onSubmit)}
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
              onClick={() => router.push(routes.ROOT_CONTESTS)}
              className="cursor-pointer text-2xl"
              data-testid="back"
            />
            <h1 className="text-2xl ml-5" data-testid="header">
              {contestState?.data ? (
                <FormattedMessage
                  {...messages.editHeader}
                  values={{ id: contestState.data.id }}
                />
              ) : (
                <FormattedMessage {...messages.createHeader} />
              )}
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
                leftIcon={<FontAwesomeIcon icon={faTrash} />}
                label={messages.delete}
                onClick={deleteModal.open}
                disabled={status !== ContestStatus.NOT_STARTED}
                data-testid="delete"
              />
            )}
            <Button
              type="submit"
              leftIcon={<FontAwesomeIcon icon={faCheck} />}
              label={messages.save}
              className="btn-primary"
              data-testid="save"
            />
          </div>
        </div>
        <div className="flex gap-x-3">
          <TextInput
            form={form}
            name="slug"
            label={messages.slug}
            data-testid="slug"
          />
          <TextInput
            form={form}
            name="title"
            label={messages.title}
            data-testid="title"
            containerClassName="flex-1"
          />
        </div>
        <CheckboxGroup
          form={form}
          options={Object.values(Language).map((it) => ({
            value: it,
            label: globalMessages.language[it],
          }))}
          name="languages"
          label={messages.languages}
          containerClassName="mt-5"
          data-testid="languages"
        />
        <div className="flex gap-x-3">
          <DateTimeInput
            form={form}
            name="startAt"
            label={messages.startAt}
            containerClassName="flex-1"
            data-testid="start-at"
            disabled={!!status && status !== ContestStatus.NOT_STARTED}
          />
          <DateTimeInput
            form={form}
            name="endAt"
            label={messages.endAt}
            containerClassName="flex-1"
            data-testid="end-at"
          />
        </div>
      </div>
      <div className="grid gap-x-15 gap-y-5 2xl:[grid-template-columns:1fr_auto_1fr]">
        <div className="mt-5">
          <div className="divider">
            <p
              className="block text-md font-semibold mb-2"
              data-testid="members-header"
            >
              <FormattedMessage {...messages.members} />
            </p>
          </div>
          <div
            className="grid [grid-template-columns:1fr_2fr_1fr_1fr_auto] items-start gap-x-3"
            data-testid="members"
          >
            {membersFields.fields.map((field, index) => (
              <Fragment key={field.id}>
                <Select
                  form={form}
                  name={`members.${index}.type`}
                  label={messages.memberType}
                  options={Object.values(MemberType)
                    .filter((it) => it !== MemberType.ROOT)
                    .map((it) => ({
                      value: it,
                      label: globalMessages.memberType[it],
                    }))}
                  data-testid="member-type"
                />
                <TextInput
                  form={form}
                  name={`members.${index}.name`}
                  label={messages.memberName}
                  data-testid="member-name"
                />
                <TextInput
                  form={form}
                  name={`members.${index}.login`}
                  label={messages.memberLogin}
                  data-testid="member-login"
                />
                <TextInput
                  form={form}
                  name={`members.${index}.password`}
                  label={messages.memberPassword}
                  placeholder={!!field._id ? "Not changed" : ""}
                  data-testid="member-password"
                />
                <Button
                  tooltip={messages.removeTooltip}
                  leftIcon={<FontAwesomeIcon icon={faTrash} />}
                  onClick={() => membersFields.remove(index)}
                  containerClassName="mt-[39]"
                  className="btn-error btn-soft"
                  data-testid="member-delete"
                />
              </Fragment>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              tooltip={messages.addTooltip}
              leftIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() =>
                membersFields.append({ type: MemberType.CONTESTANT })
              }
              containerClassName="mt-5"
              className="px-10"
              data-testid="member-add"
            />
          </div>
        </div>
        <div className="hidden 2xl:flex divider divider-horizontal mt-10" />
        <div className="mt-5">
          <div className="divider">
            <p
              className="block text-md font-semibold mb-2"
              data-testid="problems-header"
            >
              <FormattedMessage {...messages.problems} />
            </p>
          </div>
          <div
            className="grid [grid-template-columns:35px_repeat(3,1fr)_auto] items-start gap-x-3"
            data-testid="problems"
          >
            {problemsFields.fields.map((field, index) => (
              <Fragment key={field.id}>
                <TextInput
                  form={form}
                  name={`problems.${index}.letter`}
                  value={String.fromCodePoint(65 + index).toString()}
                  label={messages.problemLetter}
                  data-testid="problem-letter"
                  disabled={true}
                />
                <TextInput
                  form={form}
                  name={`problems.${index}.title`}
                  label={messages.problemTitle}
                  data-testid="problem-title"
                  containerClassName="col-span-2"
                />
                <FileInput
                  form={form}
                  originalName={`problems.${index}.description`}
                  name={`problems.${index}.newDescription`}
                  label={messages.problemDescription}
                  data-testid="problem-description"
                />
                <Button
                  leftIcon={<FontAwesomeIcon icon={faTrash} />}
                  tooltip={messages.removeTooltip}
                  onClick={() => problemsFields.remove(index)}
                  containerClassName="mt-[39]"
                  className="btn-error btn-soft"
                  data-testid="problem-delete"
                />
                <span />
                <NumberInput
                  form={form}
                  name={`problems.${index}.timeLimit`}
                  label={messages.problemTimeLimit}
                  step={500}
                  data-testid="problem-time-limit"
                />
                <NumberInput
                  form={form}
                  name={`problems.${index}.memoryLimit`}
                  label={messages.problemMemoryLimit}
                  step={512}
                  data-testid="problem-memory-limit"
                />
                <FileInput
                  form={form}
                  originalName={`problems.${index}.testCases`}
                  name={`problems.${index}.newTestCases`}
                  label={messages.problemTestCases}
                  data-testid="problem-test-cases"
                />
                <span />
              </Fragment>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              leftIcon={<FontAwesomeIcon icon={faPlus} />}
              tooltip={messages.addTooltip}
              onClick={() =>
                problemsFields.append({ timeLimit: 1000, memoryLimit: 2048 })
              }
              containerClassName="mt-5"
              className="px-10"
              data-testid="problem-add"
            />
          </div>
        </div>
      </div>

      <DialogModal
        modal={deleteModal}
        onConfirm={() => onDelete()}
        isLoading={deleteContestState.isLoading}
      >
        <p className="py-4">
          <FormattedMessage {...messages.confirmDelete} />
        </p>
      </DialogModal>
    </Form>
  );
}
