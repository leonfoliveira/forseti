import { SignInForm } from "@/app/[slug]/sign-in/SignInForm";

describe("SignInForm model", () => {
  it("requires nonempty login and password", () => {
    expect(SignInForm.schema.validate({ login: "user", password: "secret" }).error).toBeUndefined();
    expect(SignInForm.schema.validate({ login: "", password: "" }).error?.message).toContain("Login is required");
  });
});
