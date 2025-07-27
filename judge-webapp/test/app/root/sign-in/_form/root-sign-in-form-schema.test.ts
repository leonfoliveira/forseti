import { rootSignInFormSchema } from "@/app/root/sign-in/_form/root-sign-in-form-schema";
import { RootSignInForm } from "@/app/root/sign-in/_form/root-sign-in-form";

describe("rootSignInFormSchema", () => {
  const validSchema = {
    password: "validPassword123",
  } as RootSignInForm;

  it("should validate password", () => {
    expect(
      rootSignInFormSchema.validate({
        ...validSchema,
        password: undefined,
      }).error?.message,
    ).toBe("password:required");
    expect(
      rootSignInFormSchema.validate({
        ...validSchema,
        password: "",
      }).error?.message,
    ).toBe("password:required");
  });
});
