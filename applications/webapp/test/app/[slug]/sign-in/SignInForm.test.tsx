import { SignInForm } from "@/app/[slug]/sign-in/SignInForm";

describe("SignInForm model", () => {
  describe("schema", () => {
    const validData = { login: "user", password: "secret" };

    it("validates correct data", () => {
      expect(SignInForm.schema.validate(validData).error).toBeUndefined();
    });

    it("invalidates invalid login", () => {
      expect(
        SignInForm.schema.validate({ ...validData, login: "" }).error?.message,
      ).toContain("Login is required");
    });

    it("invalidates invalid password", () => {
      expect(
        SignInForm.schema.validate({ ...validData, password: "" }).error
          ?.message,
      ).toContain("Password is required");
    });
  });

  describe("getDefault", () => {
    it("returns default data", () => {
      expect(SignInForm.getDefault()).toEqual({ login: "", password: "" });
    });
  });
});
