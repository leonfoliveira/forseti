import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { defineMessages } from "react-intl";

import { attachmentService } from "@/config/composition";
import { Attachment } from "@/core/domain/model/Attachment";
import { Button } from "@/lib/component/form/button";

const messages = defineMessages({
  download: {
    id: "app._component.download-button.download",
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

  return (
    <div data-testid={`${testId}-container`}>
      <Button
        leftIcon={<FontAwesomeIcon icon={faDownload} className="text-sm" />}
        onClick={() => attachmentService.download(attachment)}
        className="btn-soft text-xs"
        tooltip={messages.download}
        data-testid={testId}
      />
    </div>
  );
}
