import { cookies } from "next/headers";

import { clearCookies } from "@/app/_lib/action/clear-cookies-server-action";

jest.mock("next/headers");

describe("clearCookie", () => {
  it("should clear the specified cookie", async () => {
    const cookiesFn = {
      delete: jest.fn(),
    };
    (cookies as jest.Mock).mockResolvedValue(cookiesFn);

    await clearCookies("test_cookie");

    expect(cookies).toHaveBeenCalled();
    expect(cookiesFn.delete).toHaveBeenCalledWith("test_cookie");
  });
});
