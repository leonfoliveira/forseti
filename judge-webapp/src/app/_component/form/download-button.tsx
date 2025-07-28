import { attachmentService } from "@/config/composition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/app/_component/form/button";
import React from "react";
import { Attachment } from "@/core/domain/model/Attachment";
import { useTranslations } from "next-intl";

type Props = {
  attachment: Attachment;
  "data-testid"?: string;
};

/**
 * Small button component to download an attachment.
 */
export function DownloadButton({ attachment, ...props }: Props) {
  const testId = props["data-testid"] || "download-button";

  const t = useTranslations("contests.[slug]._component.download-button");

  return (
    <div
      className="tooltip"
      data-tip={t("download:tooltip")}
      data-testid={`${testId}-container`}
    >
      <Button
        onClick={() => attachmentService.download(attachment)}
        className="btn-soft text-xs"
        data-testid={testId}
      >
        <FontAwesomeIcon icon={faDownload} />
      </Button>
    </div>
  );
}
