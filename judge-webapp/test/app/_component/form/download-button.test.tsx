import { Attachment } from "@/core/domain/model/Attachment";
import { fireEvent, render, screen } from "@testing-library/react";
import { DownloadButton } from "@/app/_component/form/download-button";
import { attachmentService } from "@/config/composition";

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
      "download:tooltip",
    );
    fireEvent.click(screen.getByTestId("download-button"));
    expect(attachmentService.download).toHaveBeenCalledWith(attachment);
  });
});
