import {
  memberSignInFormSchema,
  rootSignInFormSchema,
} from "@/app/auth/_form/sign-in-form-schema";

it("returns an error when login is empty for member sign-in", () => {
  const result = memberSignInFormSchema.validate({
    login: "",
    password: "password123",
  });
  expect(result.error?.details[0].message).toBe("Login is required");
});

it("returns an error when password is empty for member sign-in", () => {
  const result = memberSignInFormSchema.validate({
    login: "user123",
    password: "",
  });
  expect(result.error?.details[0].message).toBe("Password is required");
});

it("returns an error when password is empty for root sign-in", () => {
  const result = rootSignInFormSchema.validate({ password: "" });
  expect(result.error?.details[0].message).toBe("Password is required");
});
