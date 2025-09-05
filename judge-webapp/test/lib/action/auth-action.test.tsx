import { cookies } from "next/headers";

import { signOut } from "@/lib/action/auth-action";

jest.mock("next/headers");

describe("auth-actions", () => {
  it("should delete the access_token cookie on signOut", async () => {
    const deleteFn = jest.fn();
    (cookies as jest.Mock).mockResolvedValue({
      delete: deleteFn,
    });

    await signOut();

    expect(deleteFn).toHaveBeenCalledWith("access_token");
  });
});
