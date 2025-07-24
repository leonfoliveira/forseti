import { useContest } from "@/app/contests/[slug]/_component/context/contest-context";
import React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { ClarificationFormType } from "@/app/contests/[slug]/_common/_form/clarification-form-type";
import { joiResolver } from "@hookform/resolvers/joi";
import { clarificationFormSchema } from "@/app/contests/[slug]/_common/_form/clarification-form-schema";
import { Select } from "@/app/_component/form/select";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useLoadableState } from "@/app/_util/loadable-state";
import { clarificationService, contestService } from "@/config/composition";
import { useAlert } from "@/app/_context/notification-context";
import { Form } from "@/app/_component/form/form";
import { TextInput } from "@/app/_component/form/text-input";
import { toInputDTO } from "@/app/contests/[slug]/_common/_form/clarification-form-map";
import { TimestampDisplay } from "@/app/_component/timestamp-display";
import { DialogModal } from "@/app/_component/dialog-modal";
import { useModal } from "@/app/_util/modal-hook";

type Props = {
  canCreate?: boolean;
  canAnswer?: boolean;
};

export default function ClarificationsPage({
  canCreate = false,
  canAnswer = false,
}: Props) {
  const { contest } = useContest();
  const alert = useAlert();
  const createClarificationState = useLoadableState();
  const deleteClarificationState = useLoadableState();

  const t = useTranslations("contests.[slug]._common.clarifications-page");
  const s = useTranslations("contests.[slug]._common._form.clarification-form");

  const deleteModal = useModal<string>();
  const answerModal = useModal();
  const form = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
  });
  const answerForm = useForm<ClarificationFormType>({
    resolver: joiResolver(clarificationFormSchema),
  });

  async function createClarification(data: ClarificationFormType) {
    createClarificationState.start();
    try {
      await contestService.createClarification(contest.id, toInputDTO(data));
      createClarificationState.finish();
      answerModal.close();
      form.reset();
      alert.success(t("create-success"));
    } catch (error) {
      createClarificationState.fail(error, {
        default: () => alert.error(t("create-error")),
      });
    }
  }

  async function deleteClarification(id: string) {
    deleteClarificationState.start();
    try {
      await clarificationService.deleteById(id);
      deleteClarificationState.finish();
      deleteModal.close();
      alert.success(t("delete-success"));
    } catch (error) {
      deleteClarificationState.fail(error, {
        default: () => alert.error(t("delete-error")),
      });
    }
  }

  return (
    <>
      {canCreate && (
        <Form
          className="flex flex-col"
          onSubmit={form.handleSubmit(createClarification)}
          disabled={createClarificationState.isLoading}
          data-testid="form:submission"
        >
          <div className="flex gap-x-3">
            <Select
              form={form}
              name="problemId"
              s={s}
              label={t("problem:label")}
              options={(contest?.problems || []).map((it) => ({
                value: it.id.toString(),
                label: `${it.letter}. ${it.title}`,
              }))}
              data-testid="form:problem"
              containerClassName="flex-1"
            />
            <TextInput
              form={form}
              s={s}
              label={t("text:label")}
              name="text"
              containerClassName="flex-4"
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button
              type="submit"
              className="btn-primary"
              data-testid="form:submit"
              isLoading={createClarificationState.isLoading}
            >
              {t("create:label")}
              <FontAwesomeIcon icon={faPaperPlane} className="ms-3" />
            </Button>
          </div>
          <div className="divider" />
        </Form>
      )}
      {contest.clarifications.length == 0 && (
        <div
          className="flex justify-center items-center py-20"
          data-testid="clarifications:empty"
        >
          <p className="text-neutral-content">{t("empty")}</p>
        </div>
      )}
      <div className="flex flex-col gap-y-8">
        {contest.clarifications.toReversed().map((clarification) => (
          <div
            key={clarification.id}
            className="card bg-base-100 border border-base-300"
            data-testid={`clarification:${clarification.id}`}
          >
            <div className="card-body p-4 relative">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">
                  {clarification.problem?.id
                    ? t("header-problem", {
                        contestant: clarification.member.name,
                        letter: clarification.problem.letter,
                      })
                    : t("header-general", {
                        contestant: clarification.member.name,
                      })}
                </p>
                <div className="flex">
                  <span className="text-sm text-base-content/50">
                    <TimestampDisplay timestamp={clarification.createdAt} />
                  </span>
                  {canAnswer && (
                    <Button
                      className="btn-soft btn-error ml-3"
                      onClick={() => deleteModal.open(clarification.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  )}
                </div>
              </div>
              <p>{clarification.text}</p>
              {canAnswer && clarification.children.length == 0 && (
                <div className="flex justify-center absolute bottom-0 w-full translate-y-1/2">
                  <button
                    className="btn badge badge-soft badge-primary"
                    onClick={() => {
                      answerForm.reset({
                        text: "",
                        parentId: clarification.id,
                      });
                      answerModal.open();
                    }}
                  >
                    {t("answer:label")}
                  </button>
                </div>
              )}
            </div>
            {clarification.children.length > 0 && (
              <>
                <div className="divider m-0" />
                <div className="card-body p-4">
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold">
                      {t("header-answer", {
                        jury: clarification.children[0].member.name,
                      })}
                    </p>
                    <span className="text-sm text-base-content/50">
                      <TimestampDisplay
                        timestamp={clarification.children[0].createdAt}
                      />
                    </span>
                  </div>
                  <p>{clarification.children[0].text}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <DialogModal
        modal={deleteModal}
        onConfirm={deleteClarification}
        isLoading={deleteClarificationState.isLoading}
      >
        <p>{t("confirm-delete")}</p>
      </DialogModal>

      <DialogModal
        modal={answerModal}
        onConfirm={() => answerForm.handleSubmit(createClarification)()}
        isLoading={createClarificationState.isLoading}
      >
        <Form onSubmit={() => answerForm.handleSubmit(createClarification)()}>
          <TextInput
            form={answerForm}
            name="text"
            s={s}
            label={t("text:label")}
          />
        </Form>
      </DialogModal>
    </>
  );
}
