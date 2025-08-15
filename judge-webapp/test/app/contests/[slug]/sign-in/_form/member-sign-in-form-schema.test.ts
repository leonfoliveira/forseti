import { memberSignInFormSchema } from "@/app/contests/[slug]/sign-in/_form/member-sign-in-form-schema";

describe("memberSignInFormSchema", () => {
  const validData = {
    login: "testuser",
    password: "testpassword",
  };

  it("should validate correct data", () => {
    expect(memberSignInFormSchema.validate(validData).error).toBeUndefined();
  });

  it("should invalidate login", () => {
    expect(
      memberSignInFormSchema.validate({ ...validData, login: undefined }).error
        ?.message,
    ).toBe(
      "app.contests.[slug].sign-in._form.member-sign-in-form-schema.login-required",
    );
    expect(
      memberSignInFormSchema.validate({ ...validData, login: "" }).error
        ?.message,
    ).toBe(
      "app.contests.[slug].sign-in._form.member-sign-in-form-schema.login-required",
    );
  });

  it("should invalidate password", () => {
    expect(
      memberSignInFormSchema.validate({ ...validData, password: undefined })
        .error?.message,
    ).toBe(
      "app.contests.[slug].sign-in._form.member-sign-in-form-schema.password-required",
    );
    expect(
      memberSignInFormSchema.validate({ ...validData, password: "" }).error
        ?.message,
    ).toBe(
      "app.contests.[slug].sign-in._form.member-sign-in-form-schema.password-required",
    );
  });
});
