import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";
import { MemberType } from "@/domain/enumerate/MemberType";
import PrintRequestsPage from "@/app/[slug]/(dashboard)/printRequests/PrintRequestsPage";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock(
  "@/app/[slug]/(dashboard)/printRequests/AdminPrintRequestsPage",
  () => ({
    AdminPrintRequestsPage: () => (
      <div data-testid="admin-print-requests-page" />
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/printRequests/StaffPrintRequestsPage",
  () => ({
    StaffPrintRequestsPage: () => (
      <div data-testid="staff-print-requests-page" />
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/printRequests/ContestantPrintRequestsPage",
  () => ({
    ContestantPrintRequestsPage: () => (
      <div data-testid="contestant-print-requests-page" />
    ),
  }),
);

describe("PrintRequestsPage", () => {
  it("should render admin page when member is admin", async () => {
    const session = MockSessionResponseDTO({
      member: { type: MemberType.ADMIN },
    } as never);

    await renderWithProviders(<PrintRequestsPage />, { session });

    expect(screen.getByTestId("admin-print-requests-page")).toBeInTheDocument();
  });

  it("should render staff page when member is staff", async () => {
    const session = MockSessionResponseDTO({
      member: { type: MemberType.STAFF },
    } as never);

    await renderWithProviders(<PrintRequestsPage />, { session });

    expect(screen.getByTestId("staff-print-requests-page")).toBeInTheDocument();
  });

  it("should render contestant page when member is contestant", async () => {
    const session = MockSessionResponseDTO({
      member: { type: MemberType.CONTESTANT },
    } as never);

    await renderWithProviders(<PrintRequestsPage />, { session });

    expect(
      screen.getByTestId("contestant-print-requests-page"),
    ).toBeInTheDocument();
  });

  it("should navigate to forbidden page when member is not allowed", async () => {
    const session = MockSessionResponseDTO({
      member: { type: MemberType.JUDGE },
    } as never);

    await renderWithProviders(<PrintRequestsPage />, { session });

    expect(screen.getByTestId("navigate")).toBeInTheDocument();
  });
});
