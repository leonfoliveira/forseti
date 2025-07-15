import { rootSignInFormSchema } from "@/app/root/sign-in/_form/root-sign-in-form-schema";

describe("rootSignInFormSchema", () => {
  const data = {
    password: "password",
  };

  it("should validate data", () => {
    const result = rootSignInFormSchema.validate(data);
    expect(result.error).toBeUndefined();
  });

  it("should invalidate password", () => {
    expect(
      rootSignInFormSchema.validate({ ...data, password: "" }).error?.message,
    ).toBe("password:required");

    expect(
      rootSignInFormSchema.validate({ ...data, password: undefined }).error
        ?.message,
    ).toBe("password:required");
  });
});
