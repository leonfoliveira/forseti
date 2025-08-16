import { RootSignInFormType } from "@/app/root/sign-in/_form/root-sign-in-form";
import { rootSignInFormSchema } from "@/app/root/sign-in/_form/root-sign-in-form-schema";

describe("rootSignInFormSchema", () => {
  const validSchema = {
    password: "validPassword123",
  } as RootSignInFormType;

  it("should validate password", () => {
    expect(
      rootSignInFormSchema.validate({
        ...validSchema,
        password: undefined,
      }).error?.message,
    ).toBe("app.root.sign-in._form.root-sign-in-form-schema.password-required");
    expect(
      rootSignInFormSchema.validate({
        ...validSchema,
        password: "",
      }).error?.message,
    ).toBe("app.root.sign-in._form.root-sign-in-form-schema.password-required");
  });
});
