import { SignInForm } from "@/app/[slug]/sign-in/sign-in-form";

describe("SignInForm", () => {
  describe("schema validation", () => {
    it("should validate when both login and password are provided", () => {
      const validData = {
        login: "testuser",
        password: "testpassword",
      };

      const { error } = SignInForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with special characters in login", () => {
      const validData = {
        login: "test.user+123@example.com",
        password: "testpassword",
      };

      const { error } = SignInForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with complex password", () => {
      const validData = {
        login: "testuser",
        password: "ComplexP@ssw0rd!123",
      };

      const { error } = SignInForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with numeric login", () => {
      const validData = {
        login: "12345",
        password: "password",
      };

      const { error } = SignInForm.schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should fail validation when login is missing", () => {
      const invalidData = {
        password: "testpassword",
      };

      const { error } = SignInForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["login"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.login-required",
      );
    });

    it("should fail validation when login is empty string", () => {
      const invalidData = {
        login: "",
        password: "testpassword",
      };

      const { error } = SignInForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["login"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.login-required",
      );
    });

    it("should fail validation when password is missing", () => {
      const invalidData = {
        login: "testuser",
      };

      const { error } = SignInForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["password"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.password-required",
      );
    });

    it("should fail validation when password is empty string", () => {
      const invalidData = {
        login: "testuser",
        password: "",
      };

      const { error } = SignInForm.schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["password"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.password-required",
      );
    });

    it("should fail validation when both login and password are missing", () => {
      const invalidData = {};

      const { error } = SignInForm.schema.validate(invalidData, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error?.details).toHaveLength(2);

      const paths = error?.details.map((detail) => detail.path[0]);
      expect(paths).toContain("login");
      expect(paths).toContain("password");
    });

    it("should fail validation when both login and password are empty strings", () => {
      const invalidData = {
        login: "",
        password: "",
      };

      const { error } = SignInForm.schema.validate(invalidData, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error?.details).toHaveLength(2);

      const messages = error?.details.map((detail) => detail.message);
      expect(messages).toContain(
        "app.[slug].sign-in._form.sign-in-form-schema.login-required",
      );
      expect(messages).toContain(
        "app.[slug].sign-in._form.sign-in-form-schema.password-required",
      );
    });
  });

  describe("getDefault", () => {
    it("should return default form values", () => {
      const defaultValues = SignInForm.getDefault();

      expect(defaultValues).toEqual({
        login: "",
        password: "",
      });
    });
  });

  describe("messages", () => {
    it("should have all required message definitions", () => {
      expect(SignInForm.messages.loginRequired).toBeDefined();
      expect(SignInForm.messages.passwordRequired).toBeDefined();

      expect(SignInForm.messages.loginRequired.id).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.login-required",
      );
      expect(SignInForm.messages.passwordRequired.id).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.password-required",
      );
    });
  });
});
