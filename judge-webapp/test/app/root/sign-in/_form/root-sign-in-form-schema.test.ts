import { rootSignInFormSchema } from "@/app/root/sign-in/_form/root-sign-in-form-schema";
import { RootSignInFormType } from "@/app/root/sign-in/_form/root-sign-in-form-type";

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
    ).toBe("password:required");
    expect(
      rootSignInFormSchema.validate({
        ...validSchema,
        password: "",
      }).error?.message,
    ).toBe("password:required");
  });
});
