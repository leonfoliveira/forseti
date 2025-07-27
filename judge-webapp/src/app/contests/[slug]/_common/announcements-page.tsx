import React from "react";
import { useTranslations } from "next-intl";
import { TextInput } from "@/app/_component/form/text-input";
import { Button } from "@/app/_component/form/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { Form } from "@/app/_component/form/form";
import { useForm } from "react-hook-form";
import { AnnouncementForm } from "@/app/contests/[slug]/_common/_form/announcement-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { announcementFormSchema } from "@/app/contests/[slug]/_common/_form/announcement-form-schema";
import { useLoadableState } from "@/app/_util/loadable-state";
import { useAlert } from "@/app/_context/notification-context";
import { contestService } from "@/config/composition";
import { TimestampDisplay } from "@/app/_component/timestamp-display";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { AnnouncementFormMap } from "@/app/contests/[slug]/_common/_form/announcement-form-map";

type Props = {
  contest: ContestPublicResponseDTO;
  canCreate?: boolean;
};

export function AnnouncementsPage({ contest, canCreate = false }: Props) {
  const createAnnouncementState = useLoadableState();

  const alert = useAlert();

  const form = useForm<AnnouncementForm>({
    resolver: joiResolver(announcementFormSchema),
  });

  const t = useTranslations("contests.[slug]._common.announcements-page");
  const s = useTranslations("contests.[slug]._common._form.announcement-form");

  async function createAnnouncement(data: AnnouncementForm) {
    createAnnouncementState.start();
    try {
      await contestService.createAnnouncement(
        contest.id,
        AnnouncementFormMap.toInputDTO(data),
      );
      createAnnouncementState.finish();
      form.reset();
      alert.success(t("create-success"));
    } catch (error) {
      createAnnouncementState.fail(error, {
        default: () => alert.error(t("create-error")),
      });
    }
  }

  return (
    <>
      {canCreate && (
        <Form
          className="flex flex-col"
          onSubmit={form.handleSubmit(createAnnouncement)}
          disabled={createAnnouncementState.isLoading}
          data-testid="create-form"
        >
          <div className="flex gap-x-3">
            <TextInput
              form={form}
              s={s}
              label={t("text:label")}
              name="text"
              containerClassName="flex-4"
              data-testid="form-text"
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button
              type="submit"
              className="btn-primary"
              isLoading={createAnnouncementState.isLoading}
              data-testid="form-submit"
            >
              {t("create:label")}
              <FontAwesomeIcon icon={faPaperPlane} className="ms-3" />
            </Button>
          </div>
          <div className="divider" />
        </Form>
      )}
      {contest.announcements.length == 0 && (
        <div
          className="flex justify-center items-center py-20"
          data-testid="empty"
        >
          <p className="text-neutral-content">{t("empty")}</p>
        </div>
      )}
      <div className="flex flex-col gap-y-8">
        {contest.announcements.toReversed().map((announcement) => (
          <div
            key={announcement.id}
            className="card bg-base-100 border border-base-300"
          >
            <div className="card-body p-4 relative">
              <div className="flex justify-between">
                <p
                  className="text-sm font-semibold"
                  data-testid="announcement-member"
                >
                  {announcement.member.name}
                </p>
                <div className="flex">
                  <span
                    className="text-sm text-base-content/50"
                    data-testid="announcement-timestamp"
                  >
                    <TimestampDisplay timestamp={announcement.createdAt} />
                  </span>
                </div>
              </div>
              <p data-testid="announcement-text">{announcement.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
