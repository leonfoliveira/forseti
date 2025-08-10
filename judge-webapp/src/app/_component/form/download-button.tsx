import { attachmentService } from "@/config/composition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/app/_component/form/button";
import React from "react";
import { Attachment } from "@/core/domain/model/Attachment";
import { defineMessages, useIntl } from "react-intl";

const messages = defineMessages({
  download: {
    id: "_component.download-button.download",
    defaultMessage: "Download",
  },
});

type Props = {
  attachment: Attachment;
  "data-testid"?: string;
};

/**
 * Small button component to download an attachment.
 */
export function DownloadButton({ attachment, ...props }: Props) {
  const testId = props["data-testid"] || "download-button";
  const intl = useIntl();

  return (
    <div data-testid={`${testId}-container`}>
      <Button
        onClick={() => attachmentService.download(attachment)}
        className="btn-soft text-xs"
        tooltip={intl.formatMessage(messages.download)}
        data-testid={testId}
      >
        <FontAwesomeIcon icon={faDownload} />
      </Button>
    </div>
  );
}
