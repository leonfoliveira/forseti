import { fireEvent, render, screen } from "@testing-library/react";

import { attachmentService } from "@/config/composition";
import { Attachment } from "@/core/domain/model/Attachment";
import { DownloadButton } from "@/lib/component/form/download-button";

jest.mock("@/config/composition");

describe("DownloadButton", () => {
  it("renders download button with tooltip", () => {
    const attachment = {
      id: "1",
      filename: "test.pdf",
      contentType: "application/pdf",
    } as Attachment;

    render(<DownloadButton attachment={attachment} />);

    expect(screen.getByTestId("download-button:container")).toHaveAttribute(
      "data-tip",
      expect.any(String),
    );
    fireEvent.click(screen.getByTestId("download-button"));
    expect(attachmentService.download).toHaveBeenCalledWith(attachment);
  });
});
