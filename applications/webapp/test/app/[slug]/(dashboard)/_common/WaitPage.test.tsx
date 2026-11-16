import { act, screen } from "@testing-library/react";

import { WaitPage } from "@/app/[slug]/(dashboard)/_common/WaitPage";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockDate } from "@/test/mock/MockDate";
import { useNavigate } from "react-router-dom";

describe("WaitPage", () => {
  it("explains that the contest is not yet available", async () => {
    await renderWithProviders(<WaitPage />, {
      contest: MockContestResponseDTO({
        startAt: MockDate.now().future(1).toISOString(),
      }),
    });

    expect(screen.getByTestId("wait-page")).toHaveTextContent(
      "contest has not started yet",
    );
  });

  it("reloads page when contest has already started", async () => {
    await renderWithProviders(<WaitPage />, {
      contest: MockContestResponseDTO({
        startAt: MockDate.now().past(1).toISOString(),
      }),
    });

    expect(useNavigate()).toHaveBeenCalledWith(0);
  });

  it("reloads page when contest starts", async () => {
    await renderWithProviders(<WaitPage />, {
      contest: MockContestResponseDTO({
        startAt: MockDate.now().future(1).toISOString(),
      }),
    });

    await act(async () => {
      jest.advanceTimersByTime(60 * 60 * 1000);
    });

    expect(useNavigate()).toHaveBeenCalledWith(0);
  });
});
