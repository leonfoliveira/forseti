import { SignInForm } from "@/app/[slug]/signIn/SignInForm";

describe("SignInForm model", () => {
  describe("schema", () => {
    const validData = { login: "user", password: "secret" };

    it("validates correct data", () => {
      expect(SignInForm.schema.validate(validData).error).toBeUndefined();
    });

    it("invalidates invalid login", () => {
      expect(
        SignInForm.schema.validate({ ...validData, login: "" }).error?.message,
      ).toContain("[slug].signIn.SignInForm.loginRequired");
    });

    it("invalidates invalid password", () => {
      expect(
        SignInForm.schema.validate({ ...validData, password: "" }).error
          ?.message,
      ).toContain("[slug].signIn.SignInForm.passwordRequired");
    });
  });

  describe("getDefault", () => {
    it("returns default data", () => {
      expect(SignInForm.getDefault()).toEqual({ login: "", password: "" });
    });
  });
});
